const mongoose = require('mongoose');

const bazarSchema = new mongoose.Schema({
  date: { type: Date, required: [true, 'Date is required'] },
  item: { type: String, required: [true, 'Item name is required'] },
  amount: { type: Number, required: [true, 'Amount is required'], min: 0 },
  note: { type: String, default: '' }
});

module.exports = mongoose.model('Bazar', bazarSchema);