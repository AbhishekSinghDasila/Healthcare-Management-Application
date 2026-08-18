const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3010;

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'AI Service is running' });
});

// Mock AI Endpoint
app.post('/ask', (req, res) => {
  const { prompt, role } = req.body;
  // Simple mock AI response based on role
  let response = "I am a mock AI assistant.";
  if (role === 'admin') {
    response = "Based on current stats, you should focus on verifying the 3 pending doctor applications to reduce patient wait times.";
  } else if (role === 'doctor') {
    response = "Your patient satisfaction rating is 4.8. To improve, try reducing wait times in your clinic.";
  } else if (role === 'patient') {
    response = "Your recent health stats look stable. Remember to drink more water and stay active!";
  }
  
  res.status(200).json({ reply: response });
});

app.listen(PORT, () => {
  console.log(`AI Service running on port ${PORT}`);
});
