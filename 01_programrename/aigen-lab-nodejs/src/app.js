const express = require('express');
const cors = require('cors');
const app = express();

const sony = require('./handler/sony/truth-mapping-choice-2');

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get('/ping', (req, res) => {
  res.send('Service Available');
});

app.get('/api', async (req, res) => {
  try {
    const result = await sony.handler(req);

    res.send(result);
  } catch (error) {
    console.log(error);
    res.send(400);
  }
});

module.exports = app;
