const express = require('express');
const authRoutes = require('./routes/auth-routes');

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Use routes
app.use('/', authRoutes);

module.exports = app;
