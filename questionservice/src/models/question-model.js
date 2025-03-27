const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answers: { type: [Object], required: true },
    correctAnswerId: { type: Number, required: true },
    type: { type: String, required: true },
    image: { type: String, required: false },
    createdAt: { type: Date, default: Date.now, expires: 1800 }, // Autoeliminated after 30 min
});

const Question = mongoose.model('Question', questionSchema);

module.exports = { Question };