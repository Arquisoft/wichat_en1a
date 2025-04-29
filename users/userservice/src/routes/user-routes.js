const express = require('express');
const { check } = require('express-validator');
const { createUser } = require('../services/user-service');

const router = express.Router();

router.post('/adduser', [
    check('username').isLength({ min: 3 }).trim().escape()
], async (req, res) => {
    try {
        const user = await createUser(req.body);
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});
module.exports = router;
