const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    calcMode: { type: String, default: 'average' },
    rateBreakfast: { type: Number, default: 30 },
    rateLunch: { type: Number, default: 60 },
    rateDinner: { type: Number, default: 50 },
    rateSehri: { type: Number, default: 40 },
    rateIftar: { type: Number, default: 50 },
    
    periodStart: { type: String, default: '' }, 
    periodEnd: { type: String, default: '' },
    
    // 🌐 ম্যাজিক: গ্লোবাল কন্ট্রোলের জন্য নতুন ফিল্ড
    showBazarReport: { type: Boolean, default: true }
});

module.exports = mongoose.model('Setting', settingSchema);