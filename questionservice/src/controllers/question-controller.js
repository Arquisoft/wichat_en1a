const { generateQuestions } = require('../services/question-generator');

const generateQuestionsController = async (req, res) => {
    try {
        const questions = await generateQuestions();
        //To test
        if (req.path === '/questions/view') {
            return questions;
        }
        res.json(questions);
    } catch (error) {
        res.status(500).json({ status: 'fail', message: error.message });
    }
};

module.exports = { generateQuestionsController };