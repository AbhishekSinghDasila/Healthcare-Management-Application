require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3007;
const MONGO_URI = process.env.MONGO_URI;
const DOCTOR_SERVICE_URL = process.env.DOCTOR_SERVICE_URL || 'http://doctor-service:3006';
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
const ANALYTICS_SERVICE_URL = process.env.ANALYTICS_SERVICE_URL || 'http://analytics-service:3005';
// NOTIFICATION_SERVICE_URL is optional - notification calls are skipped when unset

// Fail fast if required env vars are missing
const REQUIRED_ENV_VARS = { MONGO_URI, DOCTOR_SERVICE_URL, AUTH_SERVICE_URL, ANALYTICS_SERVICE_URL };
for (const [key, value] of Object.entries(REQUIRED_ENV_VARS)) {
  if (!value) {
    console.error(`FATAL: missing required env var ${key}`);
    process.exit(1);
  }
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('Admin Service connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Audit log of admin actions (approvals, rejections, etc.)
const adminAuditLogSchema = new mongoose.Schema({
  adminId: String,
  action: String,
  targetId: String,
  details: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now }
});
const AdminAuditLog = mongoose.model('AdminAuditLog', adminAuditLogSchema);

const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ message: 'No token provided' });
    const response = await axios.get(`${AUTH_SERVICE_URL}/api/auth/verify`, {
      headers: { authorization: token }
    });
    if (!response.data.valid || response.data.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    req.user = response.data;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token verification failed' });
  }
};

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Admin Service is running' });
});

// Proxy to get pending doctors
app.get('/api/admin/doctors/pending', verifyAdmin, async (req, res) => {
  try {
    const response = await axios.get(`${DOCTOR_SERVICE_URL}/api/doctors/pending`, {
      headers: { authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'Error fetching pending doctors' });
  }
});

// Proxy to approve doctor
app.put('/api/admin/doctors/approve/:id', verifyAdmin, async (req, res) => {
  try {
    const response = await axios.put(`${DOCTOR_SERVICE_URL}/api/doctors/approve/${req.params.id}`, {}, {
      headers: { authorization: req.headers.authorization }
    });
    // Send Notification to Doctor
    if (process.env.NOTIFICATION_SERVICE_URL) {
       axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/notify`, {
         to: response.data.doctor.email,
         subject: 'Profile Approved',
         text: 'Your doctor profile has been verified and approved by the admin.',
         eventType: 'doctor_approved',
         payload: { doctorId: req.params.id }
       }).catch(e => console.error('Notification error', e));
    }

    // Fire-and-forget audit log entry - never let logging failures break the response
    AdminAuditLog.create({
      adminId: req.user.userId,
      action: 'approve_doctor',
      targetId: req.params.id,
      details: response.data
    }).catch(e => console.error('Audit log error', e.message));

    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'Error approving doctor' });
  }
});

// Proxy to reject doctor
app.put('/api/admin/doctors/reject/:id', verifyAdmin, async (req, res) => {
  try {
    const response = await axios.put(`${DOCTOR_SERVICE_URL}/api/doctors/reject/${req.params.id}`, req.body, {
      headers: { authorization: req.headers.authorization }
    });
    // Send Notification to Doctor
    if (process.env.NOTIFICATION_SERVICE_URL) {
       axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/notify`, {
         to: response.data.doctor.email,
         subject: 'Profile Not Approved',
         text: 'Your doctor profile application was not approved.',
         eventType: 'doctor_rejected',
         payload: { doctorId: req.params.id }
       }).catch(e => console.error('Notification error', e));
    }

    // Fire-and-forget audit log entry - never let logging failures break the response
    AdminAuditLog.create({
      adminId: req.user.userId,
      action: 'reject_doctor',
      targetId: req.params.id,
      details: response.data
    }).catch(e => console.error('Audit log error', e.message));

    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'Error rejecting doctor' });
  }
});

// Stats endpoint - proxies real aggregated stats from analytics-service
app.get('/api/admin/stats', verifyAdmin, async (req, res) => {
  try {
    const response = await axios.get(`${ANALYTICS_SERVICE_URL}/api/analytics/stats`, {
      headers: { authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'Error fetching stats' });
  }
});

app.listen(PORT, () => {
  console.log(`Admin Service running on port ${PORT}`);
});
