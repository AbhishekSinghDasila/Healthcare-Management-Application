require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3008;
const MONGO_URI = process.env.MONGO_URI;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
const BILLING_SERVICE_URL = process.env.BILLING_SERVICE_URL || 'http://billing-service:3004';
const DOCTOR_SERVICE_URL = process.env.DOCTOR_SERVICE_URL || 'http://doctor-service:3006';

// Fail fast if required env vars are missing
const REQUIRED_ENV_VARS = { MONGO_URI, AUTH_SERVICE_URL, BILLING_SERVICE_URL, DOCTOR_SERVICE_URL };
for (const [key, value] of Object.entries(REQUIRED_ENV_VARS)) {
  if (!value) {
    console.error(`FATAL: missing required env var ${key}`);
    process.exit(1);
  }
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('Review Service connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const reviewSchema = new mongoose.Schema({
  patientId: String,
  doctorId: String,
  appointmentId: String,
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ message: 'No token provided' });
    const response = await axios.get(`${AUTH_SERVICE_URL}/api/auth/verify`, {
      headers: { authorization: token }
    });
    if (!response.data.valid) return res.status(401).json({ message: 'Invalid token' });
    req.user = response.data;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token verification failed' });
  }
};

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Review Service is running' });
});

// Post a review
app.post('/api/reviews', verifyToken, async (req, res) => {
  try {
    const { doctorId, appointmentId, rating, comment } = req.body;
    
    // Check if review already exists for this appointment
    const existing = await Review.findOne({ appointmentId });
    if (existing) return res.status(400).json({ message: 'Review already submitted for this appointment' });

    const review = await Review.create({
      patientId: req.user.userId,
      doctorId,
      appointmentId,
      rating,
      comment
    });

    // Reward patient with coins (e.g. 50 coins)
    try {
      await axios.post(`${BILLING_SERVICE_URL}/api/billing/coins/add`, {
        patientId: req.user.userId,
        amount: 50
      }, {
        headers: { authorization: req.headers.authorization }
      });
    } catch (e) {
      console.error('Failed to reward coins', e.message);
    }

    // Recalculate and push the doctor's average rating - log and continue on failure
    try {
      const agg = await Review.aggregate([
        { $match: { doctorId } },
        { $group: { _id: '$doctorId', avg: { $avg: '$rating' } } }
      ]);
      await axios.put(`${DOCTOR_SERVICE_URL}/api/doctors/${doctorId}/rating`, {
        rating: agg[0]?.avg || rating
      });
    } catch (e) {
      console.error('Failed to update doctor rating', e.message);
    }

    res.status(201).json({ message: '✅ Review submitted and coins rewarded!', review });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit review' });
  }
});

// Get reviews for a doctor
app.get('/api/reviews/doctor/:doctorId', async (req, res) => {
  try {
    const reviews = await Review.find({ doctorId: req.params.doctorId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});

app.listen(PORT, () => {
  console.log(`Review Service running on port ${PORT}`);
});
