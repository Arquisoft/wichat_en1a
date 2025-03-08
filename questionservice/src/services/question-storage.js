const { QuestionModel } = require('../models/question-model');

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
    const questionExists = await QuestionModel.exists({ image: question.image });
    if (!questionExists) {
        await QuestionModel.create(question);
    }
};

/**
 * Stores a question without image in the database.
 * @param {Object} question - The question to be stored
 */
const saveUniqueQuestionNoImage = async (question) => {
    const questionExists = await QuestionModel.exists({ question: question.question });
    if (!questionExists) {
        await QuestionModel.create(question);
    }
};

module.exports = { saveQuestions };