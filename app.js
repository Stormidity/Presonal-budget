const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const PORT = process.env.PORT || 8080;


const app = express();
app.use(bodyParser.json());

const pool = new Pool({
  user: 'me',
  host: 'localhost',
  database: 'api',
  password: 'postgres',
  port: 5432,
});

// To create each envelope individually.

app.post('/', async (req, res, next) => {
  const { name, budget } = req.body;
  if (!name || budget === undefined) {
    return res.status(400).send({ error: 'Please enter a name and a budget' });
  }
  try {
    const result = await pool.query(
        'INSERT INTO envelopes (name, budget) VALUES ($1, $2) RETURNING *', [name, budget]
    );
    res.status(201).send(result.rows[0]);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }

});

// To get all Envelopes
app.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM envelopes');
    res.status(200).send(result.rows);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});


// To get a specific envelope by ID
app.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const result = await pool.query('SELECT * FROM envelopes WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No envelopes found.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// To update a specific envelope
app.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, budget } = req.body;
  try {
    const result = await pool.query(
        'UPDATE envelopes SET name = $1, budget = $2 WHERE id = $3 RETURNING *', [name, budget, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No envelopes found.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
})


// To delete a specific envelope
app.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const result = await pool.query(
        'DELETE FROM envelopes WHERE id = $1 RETURNING *', [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No envelopes found.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
})

// To transfer a value from one envelope to another
app.post('/transfer/:sourceId/:targetId', async (req, res) => {
  const sourceId = parseInt(req.params.sourceId);
  const targetId = parseInt(req.params.targetId);
  const amount = parseFloat(req.body.amount);

  const client = await pool.connect();

  try {
    await client.query('BEGIN')
    // To find the source
    const sourceResult = await client.query('SELECT * FROM envelopes WHERE id = $1', [sourceId]);
    if (sourceResult.rows.length === 0) {
      return res.status(404).json({ error: 'No envelopes found.' });
    }

    const sourceEnvelope = sourceResult.rows[0];
    if (sourceEnvelope.budget < amount) {
      return res.status(404).json({ error: 'Insufficient funds.' });
    }
    // To find the target
    const targetResult = await client.query('SELECT * FROM envelopes WHERE id = $1', [targetId]);
    if (targetResult.rows.length === 0) {
      return res.status(404).json({ error: 'No envelopes found.' });
    }

    // To update the envelopes
    await client.query('UPDATE envelopes SET budget = budget - $1 WHERE id = $2', [amount, sourceId]);
    await client.query('UPDATE envelopes SET budget = budget + $1 WHERE id = $2', [amount, targetId]);

    await client.query('COMMIT');

    res.json({ sourceEnvelope: {...sourceEnvelope, budget: sourceEnvelope.budget - amount }, targetEnvelope: {...targetResult.rows[0], budget: targetResult.rows[0].budget + amount} });

  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).send(error);
  } finally {
    client.release();
  }
});

// Listening port
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});

module.exports = app;
