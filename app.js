const createError = require('http-errors');
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
  const { name, budget } = req.body;
  if (!name || !budget) {
    return res.status(400).send({ error: 'Please enter a name and a budget' });
  }
  const newEnvelope = {
    id: Math.floor(Math.random() * 1000), // Generates a random ID
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



// Listening port
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});

module.exports = app;
