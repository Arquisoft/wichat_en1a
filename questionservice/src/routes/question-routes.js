const express = require('express');
const { generateQuestionsController} = require('../controllers/question-controller');
const { saveQuestions, addQuestion, getQuestions, getRandomQuestion, getQuestionById, checkAnswer, clearQuestions , getQuestionsByType} = require('../services/question-storage');


const router = express.Router();

router.get('/generate-questions', generateQuestionsController);


router.get('/questions/:type/:limit', async (req, res) => {
    const { type, limit } = req.params;

    try {
        const questions = await getQuestionsByType(type, parseInt(limit));
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/question/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const question = await getQuestionById(id);
        res.status(200).json(question);
    } catch (error) {
        res.status(404).json({ error: 'Pregunta no encontrada' });
    }
});

router.get('/question', async (req, res) => {
    try {
        const randomQuestion = await getRandomQuestion();
        if (!randomQuestion) {
            return res.status(404).json({ error: 'No se encontró una pregunta' });
        }
        res.status(200).json(randomQuestion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Ruta POST: Verify answer selected
router.post('/check-answer', async (req, res) => {
    const { questionId, selectedAnswer } = req.body;

    if (!questionId || !selectedAnswer) {
        return res.status(400).json({ error: 'Faltan datos necesarios para verificar la respuesta' });
    }

    try {
        const result = await checkAnswer(questionId, selectedAnswer);
        if (!result) {
            return res.status(404).json({ error: 'Pregunta no encontrada' });
        }

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta DELETE: Limpiar todas las preguntas (solo para pruebas)
router.delete('/questions', async (req, res) => {
    try {
        await clearQuestions();  // Llama a la función para limpiar todas las preguntas
        res.status(200).json({ message: 'Todas las preguntas han sido eliminadas' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;