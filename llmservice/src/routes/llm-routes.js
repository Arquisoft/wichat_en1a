const express = require('express');
const { sendQuestionToLLM, askAiBuddy } = require('../services/llm-service');

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

router.post('/ask', async (req, res) => {
    try {
        validateRequiredFields(req, ['question', 'gameQuestion', 'correctAnswer', 'model', 'apiKey']);
        const { question, gameQuestion, correctAnswer, model, apiKey } = req.body;

        const answer = await sendQuestionToLLM(question, gameQuestion, correctAnswer, apiKey, model);
        res.json({ answer });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.post('/aiBuddy', async (req, res) => {
    try {
        validateRequiredFields(req, ['answerCommented', 'model', 'apiKey']);
        const { answerCommented, model, apiKey } = req.body;

        const answer = await askAiBuddy(answerCommented, apiKey, model);
        res.json({ answer });
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
