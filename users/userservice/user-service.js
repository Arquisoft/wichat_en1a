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
function validateRequiredFields(res,req, requiredFields) {
    for (const field of requiredFields) {
    if (!(field in req.body)) {
      return res.status(400).json({
        error: `Missing required field: ${field}`,
        errorCode: 'signup.error.field.missing'
      });
    }
    }
    if(req.body.password!=req.body.repeatPassword){
        return res.status(400).json({
            error: 'Passwords must match',
            errorCode: 'signup.error.passwords.mismatch'
        });
    }

    if (!req.body.password || req.body.password.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long',
        errorCode: 'signup.error.passwords.length'
      });
    }
    // Password strength validation (at least 8 characters, one uppercase, one lowercase, one digit, and one special character)
    const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&_*])[A-Za-z\d@$!%*?_&]{8,}$/;
    if (!passwordStrengthRegex.test(req.body.password)) {
        return res.status(400).json({
            error: 'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character',
            errorCode: 'signup.error.passwords.contents'
        });
    }
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(req.body.username)) {
        return res.status(400).json({
            error: 'Username can only contain alphanumeric characters and underscores',
            errorCode: 'signup.error.username.contents'
        });
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
        const validationError = validateRequiredFields(res,req, ['username', 'password','repeatPassword']);
        if (validationError) return validationError;

        let username =req.body.username.toString();

        const existingUsers = await User.find({ username: username }).lean();
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'Username already taken', errorCode: "signup.error.username.taken" });
        }

        // Encrypt the password before saving it
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const newUser = new User({
            username: req.body.username,
            password: hashedPassword,
        });

        await newUser.save();
        return res.json(newUser);
    } catch (error) {
        return res.status(400).json({ error: error.message, errorCode:"signup.error.unexpected" }); 
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