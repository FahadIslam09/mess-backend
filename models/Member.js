const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'] },
  room: { type: String, required: [true, 'Room number is required'] },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Member', memberSchema);