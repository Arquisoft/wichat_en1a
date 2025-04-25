const express = require('express');
const llmRoutes = require('./routes/llm-routes');

const app = express();
app.use(express.json());
app.use('/', llmRoutes);

module.exports = app;
