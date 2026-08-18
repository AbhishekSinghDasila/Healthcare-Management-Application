const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3007;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/admindb';
const DOCTOR_SERVICE_URL = process.env.DOCTOR_SERVICE_URL || 'http://doctor-service:3006';
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Admin Service connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

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
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'Error approving doctor' });
  }
});

// Mock Stats endpoint
app.get('/api/admin/stats', verifyAdmin, async (req, res) => {
  try {
    res.json({
      totalUsers: 150,
      totalDoctors: 45,
      pendingVerifications: 3,
      totalAppointments: 320,
      revenue: 45000 // coins/INR
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

app.listen(PORT, () => {
  console.log(`Admin Service running on port ${PORT}`);
});
