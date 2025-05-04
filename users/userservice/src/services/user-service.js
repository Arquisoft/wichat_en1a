const bcrypt = require('bcrypt');
const User = require('../models/user-model');

function validateRequiredFields(res,req, requiredFields) {
    const body = req.body;
    for (const field of requiredFields) {
        if (!(field in body)) {
            return res.status(400).json({
                error: `Missing required field: ${field}`,
                errorCode: 'signup.error.field.missing'
            });
        }
    }

    if (body.password !== body.repeatPassword) {
        return res.status(400).json({
            error: 'Passwords must match',
            errorCode: 'signup.error.passwords.mismatch'
        });
    }

    if (!body.password || body.password.length < 8) {
        return res.status(400).json({
            error: 'Password must be at least 8 characters long',
            errorCode: 'signup.error.passwords.length'
        });
    }

    const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&_*])[A-Za-z\d@$!%*?_&]{8,}$/;
    if (!passwordStrengthRegex.test(body.password)) {
        return res.status(400).json({
            error: 'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character',
            errorCode: 'signup.error.passwords.contents'
        });
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(body.username)) {
        return res.status(400).json({
            error: 'Username can only contain alphanumeric characters and underscores',
            errorCode: 'signup.error.username.contents'
        });
    }
}

async function createUser(req, res) {

    try {
        const validationError = validateRequiredFields(res,req, ['username', 'password','repeatPassword']);
        if (validationError) return validationError;

        const username = req.body.username.toString();
        const existingUsers = await User.find({ username }).lean();
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'Username already taken', errorCode: "signup.error.username.taken" });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const newUser = new User({
            username: req.body.username,
            password: hashedPassword,
        });

        await newUser.save();
        return res.json(newUser);
    } catch (error) {
        return res.status(400).json({ error: error.message, errorCode:"signup.error.unexpected" });
    }
}

module.exports = { createUser };
