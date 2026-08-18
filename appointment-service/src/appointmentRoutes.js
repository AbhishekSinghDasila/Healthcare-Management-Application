const express = require('express');
const axios = require('axios');
const Appointment = require('./appointmentModel');
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

// BOOK appointment
router.post('/', verifyToken, async (req, res) => {
  try {
    const appointment = await Appointment.create({
      ...req.body,
      patientId: req.user.userId
    });
    
    // Notify Doctor via notification-service
    if (process.env.NOTIFICATION_SERVICE_URL) {
      axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/notify`, {
        to: 'doctor@example.com', // In a real app, fetch doctor email
        subject: 'New Appointment Booked',
        text: 'A new patient has booked an appointment with you.',
        eventType: 'appointment_booked',
        payload: { appointmentId: appointment._id }
      }).catch(e => console.error('Notification error', e.message));
    }

    res.status(201).json({ message: '✅ Appointment booked', appointment });
  } catch (err) {
    res.status(500).json({ message: 'Booking failed', error: err.message });
  }
});

// GET my appointments
router.get('/me', verifyToken, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user.userId })
                                          .sort({ appointmentDate: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch appointments', error: err.message });
  }
});

// GET all appointments (doctor/admin)
router.get('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const appointments = await Appointment.find().sort({ appointmentDate: 1 });
      return res.json(appointments);
    } else if (req.user.role === 'doctor') {
      const appointments = await Appointment.find({ doctorName: req.user.name }).sort({ appointmentDate: 1 });
      return res.json(appointments);
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch appointments', error: err.message });
  }
});

// UPDATE appointment status
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    // Notify Patient via notification-service
    if (process.env.NOTIFICATION_SERVICE_URL) {
      axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/notify`, {
        to: 'patient@example.com', // In a real app, fetch patient email
        subject: `Appointment ${appointment.status}`,
        text: `Your appointment status has been updated to: ${appointment.status}.`,
        eventType: 'appointment_updated',
        payload: { appointmentId: appointment._id, status: appointment.status }
      }).catch(e => console.error('Notification error', e.message));
    }

    res.json({ message: '✅ Appointment updated', appointment });
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
});

// CANCEL appointment
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json({ message: '✅ Appointment cancelled', appointment });
  } catch (err) {
    res.status(500).json({ message: 'Cancellation failed', error: err.message });
  }
});

module.exports = router;