require('dotenv').config();
const express = require('express');
const axios = require('axios');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');



const gameServiceUrl = process.env.GAME_SERVICE_URL || 'http://localhost:8005';
const questionServiceUrl = process.env.QUESTION_SERVICE_URL || 'http://localhost:8004';
const llmServiceUrl = process.env.LLM_SERVICE_URL || 'http://localhost:8003';
const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:8002';
const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:8001';

const apiKey = process.env.LLM_API_KEY;

const trustedSchemes = ["http:", "https:"];
const trustedDomains = ["gameservice", "localhost"];

const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', ''); // Extrae el token del encabezado Authorization
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, 'your-secret-key'); // Verificar el token
        req.userId = decoded.userId;  // Guardar el userId decodificado en la solicitud
        next();  // Llamar al siguiente middleware o ruta
    } catch (err) {
        return res.status(401).json({ error: 'Expired or invalid token' });
    }
};


// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

router.get('/userservice/health', async (req, res) => {
  try {
    const response = await axios.get(userServiceUrl +'/health');
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ status: 'DOWN', message: 'Authorization Service not available' });
  }
});

router.get('/authservice/health', async (req, res) => {
  try {
    const response = await axios.get(authServiceUrl +'/health');
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ status: 'DOWN', message: 'Authorization Service not available' });
  }
});

router.get('/llmservice/health', async (req, res) => {
  try {
    const response = await axios.get(llmServiceUrl +'/health');
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ status: 'DOWN', message: 'LLM Service not available' });
  }
});

router.get('/questionservice/health', async (req, res) => {
  try {
    const response = await axios.get(questionServiceUrl +'/health');
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ status: 'DOWN', message: 'Question Service not available' });
  }
});

router.get('/gameservice/health', async (req, res) => {
  try {
    const response = await axios.get(gameServiceUrl +'/health');
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ status: 'DOWN', message: 'Game Service not available' });
  }
});

router.post('/user/login', async (req, res) => {
  try {
    // Forward the login request to the authentication service
    const authResponse = await axios.post(authServiceUrl+'/login', req.body);
    res.json(authResponse.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error });
  }
});

router.post('/user/signup', async (req, res) => {
  try {
    // Forward the add user request to the user service
    const userResponse = await axios.post(userServiceUrl+'/adduser', req.body);
    res.json(userResponse.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error,errorCode: error.response.data.errorCode});
  }
});



router.post('/askllm', async (req, res) => {
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

router.post('/aiBuddy', async (req, res) => {
  try {
    const { answerCommented, model } = req.body;
    if (!answerCommented ) {
      return res.status(400).json({ error: 'Missing required fields:  answerCommented' });
    }
    const requestData = {
      ...req.body,
      apiKey,
      model: model || 'empathy'
    };

    // Forward the add user request to the user service
    const llmResponse = await axios.post(llmServiceUrl+'/aiBuddy', requestData);
    res.json(llmResponse.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to process request to aiBuddy' });  }
});

router.get('/generate-questions', async (req, res) => {
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
router.get('/questions/:type/:limit', async (req, res) => {
  const { type, limit } = req.params;

  try {
    const questions = await axios.get(`${questionServiceUrl}/questions/${type}/${limit}`);
    res.status(200).json(questions.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta GET: Obtain random question
router.get('/question', async (req, res) => {
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

router.post('/saveScore', async (req, res) => {
  try {
    const { userId, score, gameMode, questionsPassed, questionsFailed, accuracy } = req.body;
    if (!userId || typeof userId !== 'string' || score == null || !gameMode || questionsPassed == null || questionsFailed == null || accuracy == null) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const token = req.header('Authorization');

    const response = await axios.post(`${gameServiceUrl}/saveScore`, req.body, {
      headers: {
        Authorization: token
      }
    });

    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});


router.get('/scoresByUser/:userId',authenticateJWT, [
  check('userId').isLength({ min: 3 }).trim().escape(),
],async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
      const { userId } = req.params;
      const token = req.header('Authorization');

    if (!token) {
      return res.status(401).json({ error: 'Authorization token is required' });
    }


    const urlString = `${gameServiceUrl}/scoresByUser/${encodeURIComponent(userId)}`;

    let url;
    try {
      url = new URL(urlString);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Check if the URL's scheme and domain are trusted
    if (!trustedSchemes.includes(url.protocol) || !trustedDomains.includes(url.hostname)) {
      return res.status(403).json({ error: 'Forbidden: Untrusted URL' });
    }


    const response = await axios.get(url.toString(), {
        headers: {
          Authorization: token
        }
      });

      if (!response.data) {
          return res.status(404).json({ error: 'No scores found for this user' });
      }
      res.json(response.data);
  } catch (error) {
      res.status(500).json({ error: 'Error retrieving scores' });
  }
});

router.get('/leaderboard/:gameMode?', async (req, res) => {
  try {
    const { gameMode } = req.params;

    const response = await axios.get(`${gameServiceUrl}/leaderboard/${gameMode || ''}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});



module.exports = router