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
      (async () => {
        let doctorEmail = null;
        try {
          const doctorRes = await axios.get(
            `${process.env.DOCTOR_SERVICE_URL}/api/doctors/${appointment.doctorId}`
          );
          doctorEmail = doctorRes.data?.email;
        } catch (e) {
          console.error('Failed to resolve doctor email', e.message);
        }

        if (!doctorEmail) return; // can't notify without a resolved email

        axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/notify`, {
          to: doctorEmail,
          subject: 'New Appointment Booked',
          text: 'A new patient has booked an appointment with you.',
          eventType: 'appointment_booked',
          payload: { appointmentId: appointment._id }
        }).catch(e => console.error('Notification error', e.message));
      })();
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
      let filter = { doctorName: req.user.name };
      try {
        const doctorRes = await axios.get(
          `${process.env.DOCTOR_SERVICE_URL}/api/doctors/me`,
          { headers: { authorization: req.headers.authorization } }
        );
        const doctorId = doctorRes.data?._id;
        if (doctorId) {
          filter = { $or: [{ doctorId }, { doctorName: req.user.name }] };
        }
      } catch (e) {
        console.error('Failed to resolve doctor profile, falling back to name filter', e.message);
      }
      const appointments = await Appointment.find(filter).sort({ appointmentDate: 1 });
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
      (async () => {
        let patientEmail = null;
        try {
          const patientRes = await axios.get(
            `${process.env.AUTH_SERVICE_URL}/api/auth/users/${appointment.patientId}`
          );
          patientEmail = patientRes.data?.email;
        } catch (e) {
          console.error('Failed to resolve patient email', e.message);
        }

        if (!patientEmail) return; // can't notify without a resolved email

        axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/notify`, {
          to: patientEmail,
          subject: `Appointment ${appointment.status}`,
          text: `Your appointment status has been updated to: ${appointment.status}.`,
          eventType: 'appointment_updated',
          payload: { appointmentId: appointment._id, status: appointment.status }
        }).catch(e => console.error('Notification error', e.message));
      })();
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