const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./userModel');
const router = express.Router();

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });

    res.status(201).json({ message: '✅ User registered successfully', userId: user._id });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ message: '✅ Login successful', token, role: user.role, name: user.name });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// MOCK GOOGLE LOGIN
router.post('/google-login', async (req, res) => {
  try {
    const { email, name, googleId, role } = req.body;
    // Mock token verification -> we assume the client passed correct email & name for mock

    let user = await User.findOne({ email });
    if (!user) {
      // Create user if they don't exist
      user = await User.create({ 
        name, 
        email, 
        password: await bcrypt.hash(googleId || 'mock_google_password', 10), 
        role: role || 'patient' 
      });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ message: '✅ Google Login successful', token, role: user.role, name: user.name });
  } catch (err) {
    res.status(500).json({ message: 'Google Login failed', error: err.message });
  }
});

// GET user by id (internal service-to-service lookup - only ever exposes email/name)
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('email name -_id');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(404).json({ message: 'User not found' });
  }
});

// VERIFY TOKEN (used by other services)
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, userId: decoded.userId, role: decoded.role });
  } catch (err) {
    res.status(401).json({ valid: false, message: 'Invalid token' });
  }
});

module.exports = router;