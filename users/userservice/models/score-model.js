const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Relaciona con el usuario
        required: true,
    },
    score: {
        type: Number,
        default: 0, // Inicializa la puntuación en 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Score = mongoose.model('Score', scoreSchema);

module.exports = Score;
