const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answers: { type: [Object], required: true },
    correctAnswerId: { type: Number, required: true },
    type: { type: String, required: true },
    image: { type: String, required: false }
});

const QuestionModel = mongoose.model('Question', questionSchema);

module.exports = { QuestionModel };