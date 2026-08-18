const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const analyticsRoutes = require('./analyticsRoutes');

dotenv.config();

// Fail fast if required env vars are missing
process.env.AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
process.env.PATIENT_SERVICE_URL = process.env.PATIENT_SERVICE_URL || 'http://patient-service:3002';
process.env.APPOINTMENT_SERVICE_URL = process.env.APPOINTMENT_SERVICE_URL || 'http://appointment-service:3003';
process.env.BILLING_SERVICE_URL = process.env.BILLING_SERVICE_URL || 'http://billing-service:3004';
process.env.DOCTOR_SERVICE_URL = process.env.DOCTOR_SERVICE_URL || 'http://doctor-service:3006';
const REQUIRED_ENV_VARS = [
  'AUTH_SERVICE_URL',
  'PATIENT_SERVICE_URL',
  'APPOINTMENT_SERVICE_URL',
  'BILLING_SERVICE_URL',
  'DOCTOR_SERVICE_URL'
];
for (const key of REQUIRED_ENV_VARS) {
  if (!process.env[key]) {
    console.error(`FATAL: missing required env var ${key}`);
    process.exit(1);
  }
}

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/analytics', analyticsRoutes);
app.get('/health', (req, res) => res.json({ status: 'Analytics Service Running ✅' }));

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`🚀 Analytics Service running on port ${PORT}`));