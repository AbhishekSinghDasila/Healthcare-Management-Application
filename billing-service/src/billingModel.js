const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  appointmentId: {
    type: String
  },
  services: [{
    name: String,
    cost: Number
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'partial', 'paid'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'insurance', 'online'],
    default: 'cash'
  },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Bill', billingSchema);