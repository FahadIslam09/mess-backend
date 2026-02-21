const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: [true, 'Member is required'] },
  amount: { type: Number, required: [true, 'Amount is required'], min: 0 },
  date: { type: Date, required: [true, 'Date is required'] }
});

module.exports = mongoose.model('Deposit', depositSchema);