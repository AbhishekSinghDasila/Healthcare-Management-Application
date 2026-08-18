const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },
  doctorId: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true,
    enum: ['Cardiology', 'Neurology', 'Orthopedics', 'General', 'Pediatrics', 'Dermatology']
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  timeSlot: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  notes: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);