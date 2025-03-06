const axios = require('axios');
const Question = require('../models/question-model');
const { saveQuestions } = require('./question-storage');

const generateQuestions = async () => {
    try {
        const query = `
      SELECT ?entity ?entityLabel ?image WHERE {
        ?entity wdt:P31 wd:Q186516.
        ?entity rdfs:label ?entityLabel.
        ?entity wdt:P18 ?image.
        FILTER(LANG(?entityLabel) = "es").
      }
      LIMIT 10
    `;
        const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;
        const response = await axios.get(url);
        const data = response.data.results.bindings;

        if (data.length === 0) {
            throw new Error('No se encontraron datos en Wikidata');
        }

        const questions = data.map((item, index) => {
            const correctAnswer = item.entityLabel.value;
            const incorrectOptions = generateIncorrectOptions(correctAnswer, data, 3);

            return {
                question: `¿De qué país es esta bandera?`,
                image: item.image.value,
                correctAnswer: correctAnswer,
                correctAnswerId: 0, // Asumiendo que la respuesta correcta es siempre la primera opción
                type: 'flag', // Tipo de pregunta
                options: [correctAnswer, ...incorrectOptions]
            };
        });

        // Guardar en la base de datos
        await saveQuestions(questions);
        return questions;
    } catch (error) {
        throw new Error('Error al generar las preguntas: ' + error.message);
    }
};

const generateIncorrectOptions = (correctAnswer, data, numOptions) => {
    const incorrectOptions = [];
    const labels = data.map(item => item.entityLabel.value);

    while (incorrectOptions.length < numOptions) {
        const randomLabel = labels[Math.floor(Math.random() * labels.length)];
        if (randomLabel !== correctAnswer && !incorrectOptions.includes(randomLabel)) {
            incorrectOptions.push(randomLabel);
        }
    }

    return incorrectOptions;
};


module.exports = { generateQuestions };