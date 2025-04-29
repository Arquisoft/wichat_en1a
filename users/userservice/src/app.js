const express = require('express');
const bodyParser = require('body-parser');
const  usersRouter = require('./routes/user-routes');

const app = express();
app.disable("x-powered-by");

app.use(bodyParser.json());
app.use(usersRouter);

module.exports = app;
