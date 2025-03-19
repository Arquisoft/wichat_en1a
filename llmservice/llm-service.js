const axios = require('axios');
const express = require('express');

const app = express();
const port = 8003;

// Middleware to parse JSON in request body
app.use(express.json());

// Define configurations for different LLM APIs
const llmConfigs = {
  gemini: {
    url: (apiKey) => `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    transformRequest: (question) => ({
      contents: [{ parts: [{ text: question }] }]
    }),
    transformResponse: (response) => response.data.candidates[0]?.content?.parts[0]?.text
  },
  empathy: {
    url: () => 'https://empathyai.prod.empathy.co/v1/chat/completions',
    transformRequest: (question) => ({
      model: "qwen/Qwen2.5-Coder-7B-Instruct",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: question }
      ]
    }),
    transformResponse: (response) => response.data.choices[0]?.message?.content,
    headers: (apiKey) => ({
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    })
  }
};

// Function to validate required fields in the request body
function validateRequiredFields(req, requiredFields) {
  for (const field of requiredFields) {
    if (!(field in req.body)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

// Filter out direct answers from LLM responses
function filterAnswer(answer,correctAnswer) {
  if (!answer) {
    return "Could not generate a hint.";
  }

  const lowerAnswer = answer.toLowerCase();
  const lowerCorrectAnswer = correctAnswer.toLowerCase();

  // Block direct answer matches
  if (lowerAnswer.includes(lowerCorrectAnswer)) {
      return "[Hint Blocked: Try Again]";
  }

  // Block common answer-revealing patterns
  const blockedPatterns = [
      /\bthe answer is\b/i,
      /\bcorrect answer is\b/i,
      /\bit is\b\s+\w+/i,
  ];

  for (const pattern of blockedPatterns) {
      if (pattern.test(answer)) {
          return "[Hint Blocked: Try Again]";
      }
  }

  return answer;
}

// Generic function to send questions to LLM
async function sendQuestionToLLM(userQuestion, gameQuestion, correctAnswer, apiKey, model = 'gemini') {
  try {
    const config = llmConfigs[model];
    if (!config) {
      throw new Error(`Model "${model}" is not supported.`);
    }

    const url = config.url(apiKey);

    // Modify the request to include game context
    const prompt = `You are an assistant for a trivia game. 
    The current question in the game is: "${gameQuestion}" 
    The user is asking: "${userQuestion}". 
    Provide a useful hint but DO NOT reveal the answer.`;

    const requestData = config.transformRequest(prompt);

    const headers = {
      'Content-Type': 'application/json',
      ...(config.headers ? config.headers(apiKey) : {})
    };

    const response = await axios.post(url, requestData, { headers });
    const llmAnswer = config.transformResponse(response);

    // Filter the response to avoid revealing the correct answer
    llmAnswer = this.filterAnswer(llmAnswer, correctAnswer);

    return llmAnswer;

  } catch (error) {
    console.error(`Error sending question to ${model}:`, error.message || error);
    return null;
  }
}

app.post('/ask', async (req, res) => {
  try {
    // Check if required fields are present in the request body
    validateRequiredFields(req, ['question', 'model', 'apiKey']);

    const { question, model, apiKey } = req.body;
    const answer = await sendQuestionToLLM(question, apiKey, model);
    res.json({ answer });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const server = app.listen(port, () => {
  console.log(`LLM Service listening at http://localhost:${port}`);
});

module.exports = server


