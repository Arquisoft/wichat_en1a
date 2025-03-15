const { generateQuestions } = require('../services/question-generator');

const generateQuestionsController = async (req, res) => {
    const { type = 'city', numQuestions = 10 } = req.query;

    if (isNaN(numQuestions) || numQuestions <= 0) {
        return res.status(400).json({ status: 'fail', message: 'numQuestions debe ser un número mayor que 0' });
    }

    try {
        const questions = await generateQuestions(type, parseInt(numQuestions, 10));

        if (req.path === '/questions/view') {
            return res.json(questions);
        }

        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ status: 'fail', message: error.message });
    }
};

module.exports = { generateQuestionsController };