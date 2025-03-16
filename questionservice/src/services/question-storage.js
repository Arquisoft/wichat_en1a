const { Question} = require('../models/question-model');

/**
 * Stores the questions in the database.
 * If these questions are already in the database, they won't be stored.
 * @param {Array} questionsArray - Array of questions to be stored
 */
const saveQuestions = async (questionsArray) => {
    try {
        for (const question of questionsArray) {
            await saveUniqueQuestion(question);
        }
    } catch (err) {
        throw new Error('Error during question generation: ' + err.message);
    }
};

/**
 * Stores a question in the database.
 * @param {Object} question - The question to be stored
 */
const saveUniqueQuestion = async (question) => {
    if (question.image) {
        await saveUniqueQuestionImage(question);
    } else {
        await saveUniqueQuestionNoImage(question);
    }
};

/**
 * Stores a question with image in the database.
 * @param {Object} question - The question to be stored
 */
const saveUniqueQuestionImage = async (question) => {
    const questionExists = await Question.exists({ image: question.image });
    if (!questionExists) {
        await Question.create(question);
    }
};

/**
 * Stores a question without image in the database.
 * @param {Object} question - The question to be stored
 */
const saveUniqueQuestionNoImage = async (question) => {
    const questionExists = await Question.exists({ question: question.question });
    if (!questionExists) {
        await Question.create(question);
    }
};

const addQuestion = async (questionData) => {
    try {
        const newQuestion = new Question(questionData);
        await newQuestion.save();
        return newQuestion;  // Devuelve la pregunta guardada
    } catch (error) {
        console.error('Error al agregar la pregunta:', error);
        throw new Error('Error al agregar la pregunta');
    }
};

// Function to obtain all the questions
const getQuestions = async () => {
    try {
        const questions = await Question.find();
        return questions;
    } catch (error) {
        console.error('Error al obtener las preguntas:', error);
        throw new Error('Error al obtener las preguntas');
    }
};

// Function to obtain a random question
const getRandomQuestion = async () => {
    try {
        const randomQuestion = await Question.aggregate([{ $sample: { size: 1 } }]);  // Selecciona una pregunta aleatoria
        if (!randomQuestion || randomQuestion.length === 0) {
            throw new Error('No se encontraron preguntas');
        }
        return randomQuestion[0];  // Retorna la pregunta aleatoria
    } catch (error) {
        console.error('Error al obtener una pregunta aleatoria:', error);
        throw new Error('Error al obtener una pregunta aleatoria');
    }
};

// Function to obtain question by id
const getQuestionById = async (questionId) => {
    try {
        const question = await Question.findById(questionId);
        if (!question) {
            throw new Error('Pregunta no encontrada');
        }
        console.log(question)
    } catch (error) {
        console.error('Error al obtener la pregunta:', error);
        throw new Error('Error al obtener la pregunta');
    }
};

// Function to verify if the selected answer is the correct one
const checkAnswer = async (questionId, selectedAnswer) => {
    try {
        const question = await Question.findById(questionId);
        if (!question) {
            throw new Error('Pregunta no encontrada');
        }

        const isCorrect = question.answers.some(
            (answer) => answer.answer === selectedAnswer && answer.isCorrect
        );
        return { isCorrect };
    } catch (error) {
        console.error('Error al verificar la respuesta:', error);
        throw new Error('Error al verificar la respuesta');
    }
};

// Function to clean all the questions
const clearQuestions = async () => {
    try {
        await Question.deleteMany({});
    } catch (error) {
        console.error('Error al limpiar las preguntas:', error);
        throw new Error('Error al limpiar las preguntas');
    }
};

const getQuestionsByType = async (type, limit) => {
    try {
        const questions = await Question.find({ type }).limit(limit);
        return questions;
    } catch (error) {
        console.error('Error al obtener preguntas:', error);
        throw new Error('Error al obtener preguntas');
    }
};


module.exports = { saveQuestions, addQuestion,
    getQuestions,
    getRandomQuestion,
    getQuestionById,
    checkAnswer,
    clearQuestions,
    getQuestionsByType};
