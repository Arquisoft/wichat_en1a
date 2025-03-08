const express = require('express');
const bodyParser = require('body-parser');
const questionRouter = require('./routes/question-routes');

const app = express();
app.disable("x-powered-by");

app.use(bodyParser.json());
app.use(questionRouter);

module.exports = app;