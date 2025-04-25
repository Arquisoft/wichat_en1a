const express = require('express');
const { check, validationResult } = require('express-validator');
const { loginUser } = require('../services/auth-service');

const router = express.Router();

function validateRequiredFields(req, requiredFields) {
    for (const field of requiredFields) {
        if (!(field in req.body)) {
            throw new Error(`Missing required field: ${field}`);
        }
    }
}

router.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

router.post('/login', [
    check('username').isLength({ min: 3 }).trim().escape(),
    check('password').isLength({ min: 3 }).trim()
], async (req, res) => {
    try {
        validateRequiredFields(req, ['username', 'password']);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array().toString() });
        }

        const { username, password } = req.body;
        const result = await loginUser(username, password);
        res.json(result);

    } catch (error) {
        if (error.message === 'Invalid credentials') {
            res.status(401).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

module.exports = router;
