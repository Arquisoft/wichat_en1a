require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const promBundle = require('express-prom-bundle');
//libraries required for OpenAPI-Swagger
const swaggerUi = require('swagger-ui-express'); 
const fs = require("fs")
const YAML = require('yaml')

const app = express();
const port = 8000;

const gameServiceUrl = process.env.GAME_SERVICE_URL || 'http://localhost:8005';
const questionServiceUrl = process.env.QUESTION_SERVICE_URL || 'http://localhost:8004';
const llmServiceUrl = process.env.LLM_SERVICE_URL || 'http://localhost:8003';
const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:8002';
const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:8001';
const apiKey = process.env.LLM_API_KEY;


app.use(cors());
app.use(express.json());

//Prometheus configuration
const metricsMiddleware = promBundle({includeMethod: true});
app.use(metricsMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.get('/userservice/health', async (req, res) => {
  try {
    const response = await axios.get(userServiceUrl +'/health');
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ status: 'DOWN', message: 'Authorization Service not available' });
  }
});

app.get('/authservice/health', async (req, res) => {
  try {
    const response = await axios.get(authServiceUrl +'/health');
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ status: 'DOWN', message: 'Authorization Service not available' });
  }
});

app.get('/llmservice/health', async (req, res) => {
  try {
    const response = await axios.get(llmServiceUrl +'/health');
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ status: 'DOWN', message: 'LLM Service not available' });
  }
});

app.get('/questionservice/health', async (req, res) => {
  try {
    const response = await axios.get(questionServiceUrl +'/health');
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ status: 'DOWN', message: 'Question Service not available' });
  }
});

app.get('/gameservice/health', async (req, res) => {
  try {
    const response = await axios.get(gameServiceUrl +'/health');
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ status: 'DOWN', message: 'Game Service not available' });
  }
});

app.post('/login', async (req, res) => {
  try {
    // Forward the login request to the authentication service
    const authResponse = await axios.post(authServiceUrl+'/login', req.body);
    res.json(authResponse.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error });
  }
});

app.post('/adduser', async (req, res) => {
  try {
    // Forward the add user request to the user service
    const userResponse = await axios.post(userServiceUrl+'/adduser', req.body);
    res.json(userResponse.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error });
  }
});


app.post('/askllm', async (req, res) => {
  try {
    const { question, gameQuestion, correctAnswer, model } = req.body;
    if (!question || !gameQuestion || !correctAnswer) {
      return res.status(400).json({ error: 'Missing required fields: question, gameQuestion, correctAnswer' });
    }
    const requestData = {
      ...req.body,
      apiKey,
      model: model || 'empathy'
    };

    // Forward the add user request to the user service
    const llmResponse = await axios.post(llmServiceUrl+'/ask', requestData);
    res.json(llmResponse.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process request to LLM Service' });  }
});

app.get('/generate-questions', async (req, res) => {
  try {
    const { type, numQuestions } = req.query;
    if (!type || !numQuestions || isNaN(numQuestions) || numQuestions <= 0) {
      return res.status(400).json({
        error: 'Debe proporcionar un tipo de pregunta y un número válido de preguntas.',
      });
    }
    const url = questionServiceUrl + '/generate-questions' + '?type=' + type + '&numQuestions=' + numQuestions;
    const questionsResponse = await axios.get(url);
    res.json(questionsResponse.data);
  } catch (error) {
    console.error(error);
    res.status(error.response ? error.response.status : 500).json({ error: error.message });
  }
});

// Ruta GET: Obtain questions by type and limit
app.get('/questions/:type/:limit', async (req, res) => {
  const { type, limit } = req.params;

  try {
    const questions = await axios.get(`${questionServiceUrl}/questions/${type}/${limit}`);
    res.status(200).json(questions.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta GET: Obtain random question
app.get('/question', async (req, res) => {
  try {
    const randomQuestion = await axios.get(`${questionServiceUrl}/question`);
    if (!randomQuestion.data) {
      return res.status(404).json({ error: 'No se encontró una pregunta' });
    }
    res.status(200).json(randomQuestion.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/saveScore', async (req, res) => {
  try {
    const { userId, score, gameMode, questionsPassed,questionsFailed, accuracy } = req.body;
    if (!userId || typeof userId !== 'string' || score == null || !gameMode || questionsPassed == null || questionsFailed == null || accuracy == null) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const response = await axios.post(`${gameServiceUrl}/saveScore`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.get('/scoresByUser/:userId', async (req, res) => {
  try {
      const userId = req.params.userId;
      const response = await axios.get(`${gameServiceUrl}/scoresByUser/${userId}`);

      if (!response.data) {
          return res.status(404).json({ error: 'No scores found for this user' });
      }

      res.json(response.data);
  } catch (error) {
      res.status(500).json({ error: 'Error retrieving scores' });
  }
});
app.get('/leaderboard/:gameMode?', async (req, res) => {
  try {
    const { gameMode } = req.params;

    const response = await axios.get(`${gameServiceUrl}/leaderboard/${gameMode || ''}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});


// Read the OpenAPI YAML file synchronously
const openapiPath='./openapi.yaml'
if (fs.existsSync(openapiPath)) {
  const file = fs.readFileSync(openapiPath, 'utf8');

  // Parse the YAML content into a JavaScript object representing the Swagger document
  const swaggerDocument = YAML.parse(file);

  // Serve the Swagger UI documentation at the '/api-doc' endpoint
  // This middleware serves the Swagger UI files and sets up the Swagger UI page
  // It takes the parsed Swagger document as input
  app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} else {
  console.log("Not configuring OpenAPI. Configuration file not present.")
}


// Start the gateway service
const server = app.listen(port, () => {
  console.log(`Gateway Service listening at http://localhost:${port}`);
});

module.exports = server
