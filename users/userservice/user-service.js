// user-service.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./user-model')
const { check } = require('express-validator');


const app = express();
const port = 8001;

// Middleware to parse JSON in request body
app.use(express.json());

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';
mongoose.connect(mongoUri);


// Function to validate required fields in the request body
function validateRequiredFields(req, requiredFields) {
    for (const field of requiredFields) {
    if (!(field in req.body)) {
      throw new Error(`Missing required field: ${field}`);
    }
    }
    if(req.body.password!=req.body.repeatPassword){
    throw new Error('Passwords must match');
    }

    if (!req.body.password || req.body.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    // Password strength validation (at least 8 characters, one uppercase, one lowercase, one digit, and one special character)
    const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&_*])[A-Za-z\d@$!%*?_&]{8,}$/;
    if (!passwordStrengthRegex.test(req.body.password)) {
        throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character');
    }
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(req.body.username)) {
        throw new Error('Username can only contain alphanumeric characters and underscores');
    }
}

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

app.post('/adduser', [
    check('username').isLength({ min: 3 }).trim().escape()
], async (req, res) => {
    try {
        // Check if required fields are present in the request body
        validateRequiredFields(req, ['username', 'password','repeatPassword']);

        let username =req.body.username.toString();

        const existingUsers = await User.find({ username: username }).lean();
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        // Encrypt the password before saving it
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const newUser = new User({
            username: req.body.username,
            password: hashedPassword,
        });

        await newUser.save();
        res.json(newUser);
    } catch (error) {
        res.status(400).json({ error: error.message }); 
    }});

const server = app.listen(port, () => {
  console.log(`User Service listening at http://localhost:${port}`);
});

// Listen for the 'close' event on the Express.js server
server.on('close', () => {
    // Close the Mongoose connection
    mongoose.connection.close();
  });

module.exports = server