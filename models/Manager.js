const mongoose = require('mongoose');

const managerSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  year: { type: Number, required: true },
  month: { type: Number, required: true }
});

// এক মাসে যেন একাধিক ম্যানেজার সেভ না হয়
managerSchema.index({ year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Manager', managerSchema);