const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const analyticsRoutes = require('./analyticsRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/analytics', analyticsRoutes);
app.get('/health', (req, res) => res.json({ status: 'Analytics Service Running ✅' }));

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`🚀 Analytics Service running on port ${PORT}`));