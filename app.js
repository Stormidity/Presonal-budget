const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const PORT = process.env.PORT || 8080;


const envelopesMain = require('./envelopes');


const app = express();
app.use(express.json());

// To create each envelope individually.

app.post('/', (req, res, next) => {
  const envelopes = envelopesMain;
  let lastId = envelopes.length - 1;
  const { name, budget } = req.body;
  if (!name || !budget) {
    return res.status(400).send({ error: 'Please enter a name and a budget' });
  }
  const newEnvelope = {
    id: ++lastId, // Generates a random ID
    name,
    budget,
  };
  envelopes.push(newEnvelope);
  res.status(201).send(newEnvelope);
});

// To get all Envelopes
app.get('/', (req, res, next) => {
  try {
    const envelopes = envelopesMain;
    res.status(200).send(envelopes);
  } catch (err) {
    res.status(400).send(err)
  }
});


// To get a specific envelope by ID
app.get('/:id', (req, res) => {
  const envelopes = envelopesMain;
  const id = parseInt(req.params.id);
  const envelope = envelopes.find((envelope) => envelope.id === id);
  if (!envelope) {
    return res.status(404).json({ error: 'No envelope found!' });
  }
    res.json(envelope);
});

// To update a specific envelope
app.put('/:id', (req, res) => {
  const envelopes = envelopesMain;
  const id = parseInt(req.params.id);
  const envelopeIndex = envelopes.findIndex((envelope) => envelope.id === id);

  if (envelopeIndex === -1) {
    return res.status(404).json({ error: 'No envelope found!' });
  }

  const updatedEnvelope = {...envelopes[envelopeIndex], ...req.body};
  // To ensure budget isn't a negative number
  if (updatedEnvelope.budget !== undefined && updatedEnvelope.budget < 0) {
    return res.status(400).json({ error: 'Budget cannot be negative.' });
  }

  envelopes[envelopeIndex] = updatedEnvelope;
  res.json(updatedEnvelope);
})


// To delete a specific envelope
app.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const envelopes = envelopesMain;
  const envelopeIndex = envelopes.findIndex((envelope) => envelope.id === id);

  if (envelopeIndex === -1) {
    return res.status(404).json({ error: 'No envelope found!' });
  }

  const deletedEnvelope = envelopes.splice(envelopeIndex, 1);
  res.json(deletedEnvelope[0]);
})

// To transfer a value from one envelope to another
app.post('/transfer/:sourceId/:targetId', (req, res) => {
  const sourceId = parseInt(req.params.sourceId);
  const targetId = parseInt(req.params.targetId);
  const amount = parseFloat(req.body.amount);
  const envelopes = envelopesMain;

  // To find the source
  const sourceEnvelopeIndex = envelopes.findIndex((envelope) => envelope.id === sourceId);
  if (sourceEnvelopeIndex === -1) {
    return res.status(404).json({ error: 'Source envelope not found!' });
  }
  const sourceEnvelope = envelopes[sourceEnvelopeIndex];

  // To find the target
  const targetEnvelopeIndex = envelopes.findIndex((envelope) => envelope.id === targetId);
  if (targetEnvelopeIndex === -1) {
    return res.status(404).json({ error: 'Target envelope not found!' });
  }
  const targetEnvelope = envelopes[sourceEnvelopeIndex];

  // To check if there's enough budget in the source
  if (sourceEnvelope.budget < amount) {
    return res.status(400).json({error: 'Insufficient funds!'});
  }

  envelopes[sourceEnvelopeIndex].budget -= amount;
  envelopes[targetEnvelopeIndex].budget += amount;

  res.json({ sourceEnvelope: envelopes[sourceEnvelopeIndex], targetEnvelope: envelopes[targetEnvelopeIndex] });
})

// Listening port
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});

module.exports = app;
