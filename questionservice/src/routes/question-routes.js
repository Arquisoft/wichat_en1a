const express = require('express');
const { generateQuestionsController} = require('../controllers/question-controller');

const router = express.Router();

router.get('/questions', generateQuestionsController);
//router.get('/questions/types', getQuestionTypesController);

//To test
router.get('/questions/view', async (req, res) => {
    //const { generateQuestions } = require('../services/question-generator');
    const questions = await generateQuestionsController(req, res);
    res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Preguntas sobre Banderas</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 20px;
        }
        .question-container {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
          padding: 20px;
        }
        .question {
          font-size: 1.2em;
          margin-bottom: 10px;
        }
        .options {
          list-style-type: none;
          padding: 0;
        }
        .options li {
          background-color: #e0e0e0;
          border-radius: 4px;
          margin-bottom: 10px;
          padding: 10px;
          cursor: pointer;
        }
        .options li:hover {
          background-color: #d0d0d0;
        }
        .image {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin-bottom: 10px;
        }
      </style>
    </head>
    <body>
      <h1>Preguntas sobre Banderas</h1>
      ${questions.map(question => `
        <div class="question-container">
          <img src="${question.image}" alt="Bandera" class="image">
          <div class="question">${question.question}</div>
          <ul class="options">
            ${question.options.map(option => `<li>${option}</li>`).join('')}
          </ul>
        </div>
      `).join('')}
    </body>
    </html>
  `);
});

module.exports = router;