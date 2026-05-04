const express = require('express');
const axios = require('axios');
const Doctor = require('./doctorModel');
const router = express.Router();

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

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  next();
};

// Doctor registers their profile (status = pending)
router.post('/register', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can register a doctor profile' });
    }
    const existing = await Doctor.findOne({ userId: req.user.userId });
    if (existing) return res.status(400).json({ message: 'Doctor profile already exists' });

    const doctor = await Doctor.create({
      ...req.body,
      userId: req.user.userId,
      status: 'pending'
    });
    res.status(201).json({ message: '✅ Doctor profile submitted for approval', doctor });
  } catch (err) {
    res.status(500).json({ message: 'Failed to register doctor', error: err.message });
  }
});

// GET all approved doctors (public - for patients to browse)
router.get('/approved', async (req, res) => {
  try {
    const { specialization, city } = req.query;
    const filter = { status: 'approved' };
    if (specialization) filter.specialization = specialization;
    if (city) filter['clinic.city'] = new RegExp(city, 'i');
    const doctors = await Doctor.find(filter).select('-userId');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch doctors', error: err.message });
  }
});

// GET all doctors (admin only)
router.get('/all', verifyToken, isAdmin, async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch doctors', error: err.message });
  }
});

// GET pending doctors (admin only)
router.get('/pending', verifyToken, isAdmin, async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch pending doctors', error: err.message });
  }
});

// APPROVE doctor (admin only)
router.put('/approve/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ message: '✅ Doctor approved successfully', doctor });
  } catch (err) {
    res.status(500).json({ message: 'Approval failed', error: err.message });
  }
});

// REJECT doctor (admin only)
router.put('/reject/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', rejectionReason: reason },
      { new: true }
    );
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ message: '✅ Doctor rejected', doctor });
  } catch (err) {
    res.status(500).json({ message: 'Rejection failed', error: err.message });
  }
});

// GET my doctor profile
router.get('/me', verifyToken, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.userId });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile', error: err.message });
  }
});

// GET single doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch doctor', error: err.message });
  }
});

// UPDATE my doctor profile
router.put('/me/update', verifyToken, async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user.userId },
      req.body,
      { new: true }
    );
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
    res.json({ message: '✅ Profile updated', doctor });
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
});

module.exports = router;