const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db');
const patientRoutes = require('./patientRoutes');

dotenv.config();

// Fail fast if required env vars are missing
process.env.AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
const REQUIRED_ENV_VARS = ['MONGO_URI', 'AUTH_SERVICE_URL'];
for (const key of REQUIRED_ENV_VARS) {
  if (!process.env[key]) {
    console.error(`FATAL: missing required env var ${key}`);
    process.exit(1);
  }
}

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/patients', patientRoutes);

app.get('/health', (req, res) => res.json({ status: 'Patient Service Running ✅' }));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`🚀 Patient Service running on port ${PORT}`));