const express = require('express');
const bodyParser = require('body-parser');

const { statuses } = require('./config');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError) {
    res.status(400).json({ error: statuses[400] });
  } else {
    next();
  }
});

const routes = require('./routes');

app.use(Object.values(routes));

app.use((req, res) => {
  res.status(404).json({ error: statuses[404] });
});

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});
