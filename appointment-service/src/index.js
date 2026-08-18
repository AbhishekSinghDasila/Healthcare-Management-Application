const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db');
const appointmentRoutes = require('./appointmentRoutes');

dotenv.config();

// Fail fast if required env vars are missing
process.env.AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
process.env.DOCTOR_SERVICE_URL = process.env.DOCTOR_SERVICE_URL || 'http://doctor-service:3006';
// NOTIFICATION_SERVICE_URL is optional - notification calls are skipped when unset
const REQUIRED_ENV_VARS = ['MONGO_URI', 'AUTH_SERVICE_URL', 'DOCTOR_SERVICE_URL'];
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

app.use('/api/appointments', appointmentRoutes);

app.get('/health', (req, res) => res.json({ status: 'Appointment Service Running ✅' }));

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`🚀 Appointment Service running on port ${PORT}`));