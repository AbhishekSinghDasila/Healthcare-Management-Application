const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db');
const billingRoutes = require('./billingRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/billing', billingRoutes);

app.get('/health', (req, res) => res.json({ status: 'Billing Service Running ✅' }));

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`🚀 Billing Service running on port ${PORT}`));