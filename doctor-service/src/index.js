const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db');
const doctorRoutes = require('./doctorRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/doctors', doctorRoutes);
app.get('/health', (req, res) => res.json({ status: 'Doctor Service Running ✅' }));

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => console.log(`🚀 Doctor Service running on port ${PORT}`));