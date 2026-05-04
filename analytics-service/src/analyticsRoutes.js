const express = require('express');
const axios = require('axios');
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

// GET dashboard stats
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const headers = { authorization: req.headers.authorization };

    const [patientsRes, appointmentsRes, billingsRes] = await Promise.allSettled([
      axios.get(`${process.env.PATIENT_SERVICE_URL}/api/patients`, { headers }),
      axios.get(`${process.env.APPOINTMENT_SERVICE_URL}/api/appointments`, { headers }),
      axios.get(`${process.env.BILLING_SERVICE_URL}/api/billing`, { headers })
    ]);

    const patients = patientsRes.status === 'fulfilled' ? patientsRes.value.data : [];
    const appointments = appointmentsRes.status === 'fulfilled' ? appointmentsRes.value.data : [];
    const billings = billingsRes.status === 'fulfilled' ? billingsRes.value.data : [];

    // Appointment stats
    const scheduled = appointments.filter(a => a.status === 'scheduled').length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const cancelled = appointments.filter(a => a.status === 'cancelled').length;

    // Department breakdown
    const deptMap = {};
    appointments.forEach(a => {
      deptMap[a.department] = (deptMap[a.department] || 0) + 1;
    });
    const departmentStats = Object.entries(deptMap).map(([name, count]) => ({ name, count }));

    // Billing stats
    const totalRevenue = billings.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
    const pendingRevenue = billings.reduce((sum, b) => sum + (b.totalAmount - b.paidAmount), 0);
    const paidBills = billings.filter(b => b.status === 'paid').length;
    const pendingBills = billings.filter(b => b.status === 'pending').length;

    // Monthly appointments (last 6 months)
    const monthlyData = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthlyData[key] = 0;
    }
    appointments.forEach(a => {
      const d = new Date(a.appointmentDate);
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (monthlyData[key] !== undefined) monthlyData[key]++;
    });
    const monthlyAppointments = Object.entries(monthlyData).map(([month, count]) => ({ month, count }));

    // Gender breakdown
    const maleCount = patients.filter(p => p.gender === 'Male').length;
    const femaleCount = patients.filter(p => p.gender === 'Female').length;
    const otherCount = patients.filter(p => p.gender === 'Other').length;

    res.json({
      overview: {
        totalPatients: patients.length,
        totalAppointments: appointments.length,
        totalRevenue: totalRevenue.toFixed(2),
        pendingRevenue: pendingRevenue.toFixed(2),
      },
      appointmentStats: { scheduled, completed, cancelled },
      departmentStats,
      monthlyAppointments,
      billingStats: { paidBills, pendingBills, totalBills: billings.length },
      genderStats: [
        { name: 'Male', value: maleCount },
        { name: 'Female', value: femaleCount },
        { name: 'Other', value: otherCount }
      ]
    });
  } catch (err) {
    res.status(500).json({ message: 'Analytics failed', error: err.message });
  }
});

// GET recent activity
router.get('/recent', verifyToken, async (req, res) => {
  try {
    const headers = { authorization: req.headers.authorization };
    const [appointmentsRes, billingsRes] = await Promise.allSettled([
      axios.get(`${process.env.APPOINTMENT_SERVICE_URL}/api/appointments`, { headers }),
      axios.get(`${process.env.BILLING_SERVICE_URL}/api/billing`, { headers })
    ]);
    const appointments = appointmentsRes.status === 'fulfilled'
      ? appointmentsRes.value.data.slice(0, 5) : [];
    const billings = billingsRes.status === 'fulfilled'
      ? billingsRes.value.data.slice(0, 5) : [];
    res.json({ recentAppointments: appointments, recentBillings: billings });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch recent activity', error: err.message });
  }
});

module.exports = router;