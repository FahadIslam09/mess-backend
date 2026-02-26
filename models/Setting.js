const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    calcMode: { type: String, default: 'average' },
    rateBreakfast: { type: Number, default: 30 },
    rateLunch: { type: Number, default: 60 },
    rateDinner: { type: Number, default: 50 },
    rateSehri: { type: Number, default: 40 },
    rateIftar: { type: Number, default: 50 }
});

module.exports = mongoose.model('Setting', settingSchema);