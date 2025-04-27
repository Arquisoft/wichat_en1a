const mongoose = require('mongoose');
const app = require('./app');

const port = process.env.PORT || 8002;
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';

mongoose.connect(mongoUri)
    .then(() => {
        const server = app.listen(port, () => {
            console.log(`Auth Service listening at http://localhost:${port}`);
        });

        server.on('close', () => {
            mongoose.connection.close();
        });

        module.exports = server;
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB:', err);
    });
