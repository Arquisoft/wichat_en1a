const app = require('./app');

const port = process.env.PORT || 8003;
const server = app.listen(port, () => {
    console.log(`LLM Service listening on port http://localhost:${port}`);
});

module.exports = server;
