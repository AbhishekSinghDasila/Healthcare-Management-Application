const express = require('express');
const axios = require('axios');
const { Bill, Wallet } = require('./billingModel');
const router = express.Router();

// Verify token middleware
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

// CREATE bill (admin/doctor only)
router.post('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const bill = await Bill.create(req.body);
    res.status(201).json({ message: '✅ Bill created', bill });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create bill', error: err.message });
  }
});

// GET my bills (patient)
router.get('/me', verifyToken, async (req, res) => {
  try {
    const bills = await Bill.find({ patientId: req.user.userId })
                            .sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bills', error: err.message });
  }
});

// GET all bills (admin/doctor)
router.get('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const bills = await Bill.find().sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bills', error: err.message });
  }
});

// UPDATE payment
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    const { paidAmount, paymentMethod } = req.body;
    bill.paidAmount = paidAmount;
    bill.paymentMethod = paymentMethod || bill.paymentMethod;

    if (paidAmount >= bill.totalAmount) bill.status = 'paid';
    else if (paidAmount > 0) bill.status = 'partial';
    else bill.status = 'pending';

    await bill.save();
    res.json({ message: '✅ Payment updated', bill });
  } catch (err) {
    res.status(500).json({ message: 'Payment update failed', error: err.message });
  }
});

// GET single bill
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bill', error: err.message });
  }
});

// COINS LOGIC
router.post('/coins/add', verifyToken, async (req, res) => {
  try {
    const { patientId, amount } = req.body;
    let wallet = await Wallet.findOne({ patientId });
    if (!wallet) {
      wallet = new Wallet({ patientId, coins: 0 });
    }
    wallet.coins += amount;
    await wallet.save();
    res.json({ message: 'Coins added successfully', coins: wallet.coins });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add coins', error: err.message });
  }
});

router.get('/wallet', verifyToken, async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ patientId: req.user.userId });
    if (!wallet) {
      wallet = await Wallet.create({ patientId: req.user.userId, coins: 0 });
    }
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch wallet' });
  }
});

// MOCK RAZORPAY PAYMENT
router.post('/razorpay/create-order', verifyToken, async (req, res) => {
  try {
    const { amount } = req.body;
    // Mock Razorpay order
    const mockOrder = {
      id: `order_${Math.random().toString(36).substring(7)}`,
      amount: amount * 100, // in paise
      currency: "INR",
      status: "created"
    };
    res.json(mockOrder);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create mock order' });
  }
});

router.post('/razorpay/verify', verifyToken, async (req, res) => {
  try {
    // In a real app, verify razorpay signature here
    // Mock success
    const { billId, coinsUsed } = req.body;
    const bill = await Bill.findById(billId);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    if (coinsUsed) {
       let wallet = await Wallet.findOne({ patientId: req.user.userId });
       if (wallet && wallet.coins >= coinsUsed) {
         wallet.coins -= coinsUsed;
         await wallet.save();
       }
    }

    bill.status = 'paid';
    bill.paidAmount = bill.totalAmount;
    bill.paymentMethod = 'online';
    await bill.save();

    res.json({ message: '✅ Payment verified and bill updated', bill });
  } catch (err) {
    res.status(500).json({ message: 'Failed to verify payment' });
  }
});

module.exports = router;