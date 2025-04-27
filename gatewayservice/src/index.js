require('dotenv').config();
const app = require('./app');

const port = process.env.PORT || 8000;

const server = app.listen(port, () => {
    console.log(`Gateway Service listening at http://localhost:${port}`);
});

module.exports = server;