const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  specialization: {
    type: String,
    required: true,
    enum: [
      'Cardiology', 'Neurology', 'Orthopedics', 'General',
      'Pediatrics', 'Dermatology', 'Gynecology', 'Psychiatry',
      'Ophthalmology', 'ENT', 'Dentistry', 'Radiology'
    ]
  },
  experience: { type: Number, required: true },
  fees: { type: Number, required: true },
  phone: { type: String, required: true },
  qualifications: [String],
  availableDays: [{
    type: String,
    enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
  }],
  availableTimeSlots: [String],
  clinic: {
    name: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    lat: Number,
    lng: Number
  },
  about: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: String,
  rating: { type: Number, default: 0 },
  totalPatients: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);