const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Patient DB Connected');
  } catch (err) {
    console.error('❌ Patient DB Connection Failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;