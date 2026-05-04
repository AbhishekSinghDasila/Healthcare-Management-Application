const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db');
const patientRoutes = require('./patientRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/patients', patientRoutes);

app.get('/health', (req, res) => res.json({ status: 'Patient Service Running ✅' }));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`🚀 Patient Service running on port ${PORT}`));