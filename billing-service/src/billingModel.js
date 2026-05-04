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

const walletSchema = new mongoose.Schema({
  patientId: { type: String, required: true, unique: true },
  coins: { type: Number, default: 0 }
});

const Wallet = mongoose.model('Wallet', walletSchema);
const Bill = mongoose.model('Bill', billingSchema);

module.exports = { Bill, Wallet };