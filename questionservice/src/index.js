const mongoose = require('mongoose');
const app = require('./app');

const port = 8004;
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/questiondb';

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });



mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
    const server = app.listen(port, () => {
        console.log(`Question Service listening at http://localhost:${port}`);
    });

    server.on('close', () => {
        mongoose.connection.close();
    });
});

mongoose.connection.on('error', (err) => {
    console.error('Error connecting to MongoDB:', err.message);
});