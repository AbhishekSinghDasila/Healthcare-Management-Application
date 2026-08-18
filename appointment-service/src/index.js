const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db');
const appointmentRoutes = require('./appointmentRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/appointments', appointmentRoutes);

app.get('/health', (req, res) => res.json({ status: 'Appointment Service Running ✅' }));

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`🚀 Appointment Service running on port ${PORT}`));