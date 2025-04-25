const axios = require('axios');
const llmConfigs = require('../models/llm-configs');

function filterAnswer(answer, correctAnswer) {
  if (!answer) return "Could not generate a hint.";
  const lowerAnswer = answer.toLowerCase();
  const lowerCorrectAnswer = correctAnswer.toLowerCase();

  if (lowerAnswer.includes(lowerCorrectAnswer)) return "[Hint Blocked: Try Again]";

  const blockedPatterns = [
    /\bthe answer is\b/i,
    /\bcorrect answer is\b/i,
    /\bit is\b\s+\w+/i,
  ];

  for (const pattern of blockedPatterns) {
    if (pattern.test(answer)) return "[Hint Blocked: Try Again]";
  }

  return answer;
}

async function sendQuestionToLLM(userQuestion, gameQuestion, correctAnswer, apiKey, model = 'empathy') {
  const config = llmConfigs[model];
  if (!config) throw new Error(`Model "${model}" is not supported.`);

  const prompt = `
    You are an assistant in a visual trivia game. The user is shown an image (of a flag, a city, a famous person, or a scientist) and must choose the correct answer from four options.

      Your task is to generate a hint that helps the user reason their way to the correct answer — without giving it away explicitly.

      STRICT RULES (YOU MUST FOLLOW THESE):
      - DO NOT reveal or confirm the correct answer.
      - DO NOT say things like "the answer is", "it starts with", "you're right", or "I think it’s".
      - DO NOT give letter or name-based hints.
      - DO NOT mention the name, nationality, or text that appears in the image.
      - DO NOT eliminate or validate any of the multiple-choice options.
      - DO NOT provide Googleable hints that directly point to the answer.
      - DO NOT describe visual elements (e.g. flags, clothing, symbols) that directly identify the answer.

      INSTEAD:
      - Use general knowledge, history, culture, or logical reasoning related to the correct answer to craft your hint.
      - The hint must be INDIRECT but USEFUL — it should guide the user toward the correct answer by helping them think or recall relevant information.
      - Keep it short (1–2 sentences), educational, and subtle.
      - Stay neutral and avoid leading language.

      Image Context: "${gameQuestion}"
      Correct Answer (FOR CONTEXT ONLY — DO NOT REVEAL): "${correctAnswer}"
      User's Request: "${userQuestion}"

      Now generate a short, educational, and indirect hint to help the user think their way to the correct answer:
`;

  const requestData = config.transformRequest(prompt);
  const headers = {
    'Content-Type': 'application/json',
    ...(config.headers ? config.headers(apiKey) : {})
  };

  const response = await axios.post(config.url(apiKey), requestData, { headers });
  let llmAnswer = config.transformResponse(response);

  return filterAnswer(llmAnswer, correctAnswer);
}

module.exports = {
  sendQuestionToLLM, filterAnswer
};
