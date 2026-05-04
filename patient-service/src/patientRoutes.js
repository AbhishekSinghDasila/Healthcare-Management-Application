const express = require('express');
const axios = require('axios');
const Patient = require('./patientModel');
const router = express.Router();

// Middleware to verify token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const response = await axios.get(
      `${process.env.AUTH_SERVICE_URL}/api/auth/verify`,
      { headers: { authorization: token } }
    );

    if (!response.data.valid) return res.status(401).json({ message: 'Invalid token' });

    req.user = response.data;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token verification failed' });
  }
};

// CREATE patient record
router.post('/', verifyToken, async (req, res) => {
  try {
    const existing = await Patient.findOne({ userId: req.user.userId });
    if (existing) return res.status(400).json({ message: 'Patient record already exists' });

    const patient = await Patient.create({ ...req.body, userId: req.user.userId });
    res.status(201).json({ message: '✅ Patient record created', patient });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create record', error: err.message });
  }
});

// GET my patient record
router.get('/me', verifyToken, async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId });
    if (!patient) return res.status(404).json({ message: 'Patient record not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch record', error: err.message });
  }
});

// GET patient by ID (for doctors/admin)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch patient', error: err.message });
  }
});

// UPDATE patient record
router.put('/me', verifyToken, async (req, res) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { userId: req.user.userId },
      req.body,
      { new: true }
    );
    if (!patient) return res.status(404).json({ message: 'Patient record not found' });
    res.json({ message: '✅ Record updated', patient });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update record', error: err.message });
  }
});

// GET all patients (admin only)
router.get('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const patients = await Patient.find();
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch patients', error: err.message });
  }
});

module.exports = router;