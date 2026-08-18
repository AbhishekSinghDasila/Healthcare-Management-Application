const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  bloodGroup: {
    type: String
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String
  },
  medicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    notes: String
  }],
  allergies: [String],
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);