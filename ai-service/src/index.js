require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3010;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('FATAL ERROR: GEMINI_API_KEY is not defined in environment variables.');
  process.exit(1);
}

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'AI Service is running' });
});

// Builds a role-specific system-style instruction to prefix the user's prompt.
function buildPrompt(prompt, role) {
  if (role === 'admin') {
    return `You are a platform-operations assistant helping a healthcare platform administrator. Be concise, data-aware, and operational in tone. Question: ${prompt}`;
  } else if (role === 'doctor') {
    return `You are a clinical and operational assistant helping a doctor manage their practice. Be professional, precise, and clinically informed, while making clear you are not a substitute for the doctor's own clinical judgment. Question: ${prompt}`;
  } else if (role === 'patient') {
    return `You are a helpful healthcare assistant answering a patient's question. Be clear, reassuring, and always recommend consulting a real doctor for medical concerns rather than self-diagnosing. Question: ${prompt}`;
  }
  return `You are a helpful healthcare assistant. Question: ${prompt}`;
}

// Original canned responses, kept as a runtime fallback if the Gemini call fails.
function fallbackResponse(role) {
  if (role === 'admin') {
    return 'Based on current stats, you should focus on verifying the 3 pending doctor applications to reduce patient wait times.';
  } else if (role === 'doctor') {
    return 'Your patient satisfaction rating is 4.8. To improve, try reducing wait times in your clinic.';
  } else if (role === 'patient') {
    return 'Your recent health stats look stable. Remember to drink more water and stay active!';
  }
  return 'I am a mock AI assistant.';
}

app.post('/ask', async (req, res) => {
  const { prompt, role } = req.body;

  try {
    const fullPrompt = buildPrompt(prompt, role);

    const geminiResponse = await axios.post(GEMINI_API_URL, {
      contents: [
        {
          parts: [{ text: fullPrompt }],
        },
      ],
    });

    const reply = geminiResponse.data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply });
  } catch (error) {
    console.error('Gemini API call failed, falling back to canned response:', error.message);
    res.status(200).json({ reply: fallbackResponse(role) });
  }
});

app.listen(PORT, () => {
  console.log(`AI Service running on port ${PORT}`);
});
