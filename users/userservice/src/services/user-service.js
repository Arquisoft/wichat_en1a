const bcrypt = require('bcrypt');
const User = require('../models/user-model');

function validateRequiredFields(body) {
    const requiredFields = ['username', 'password', 'repeatPassword'];
    for (const field of requiredFields) {
        if (!(field in body)) {
            throw new Error(`Missing required field: ${field}`);
        }
    }

    if (body.password !== body.repeatPassword) {
        throw new Error('Passwords must match');
    }

    if (!body.password || body.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
    }

    const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&_*])[A-Za-z\d@$!%*?_&]{8,}$/;
    if (!passwordStrengthRegex.test(body.password)) {
        throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character');
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(body.username)) {
        throw new Error('Username can only contain alphanumeric characters and underscores');
    }
}

async function createUser(data) {
    validateRequiredFields(data);

    const existingUsers = await User.find({ username: data.username }).lean();
    if (existingUsers.length > 0) {
        throw new Error('Username already taken');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = new User({
        username: data.username,
        password: hashedPassword,
    });

    await newUser.save();
    return newUser;
}

module.exports = { createUser };
