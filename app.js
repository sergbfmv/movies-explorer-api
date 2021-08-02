const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();
const helmet = require('helmet');
const limiter = require('./middlewares/rate-limiter');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT = 3000 } = process.env;
const routers = require('./routes/index');
const { headError } = require('./middlewares/headError');

const allowedCors = [
  'https:////api.serg-movies.diploma.nomoredomains.monster',
  'http:////api.serg-movies.diploma.nomoredomains.monster',
  'localhost:3000',
];

const app = express();

app.use((req, res, next) => {
  const { origin } = req.headers;
  if (allowedCors.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  next();
});

app.use(requestLogger);

app.use(limiter);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/bitfilmsdb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(helmet());

app.use('/', routers);

app.use(errorLogger);

app.use(headError);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${PORT}`);
});
