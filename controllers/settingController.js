const Setting = require('../models/Setting');

// সেটিংস ডাটাবেস থেকে আনা
exports.getSettings = async (req, res, next) => {
    try {
        let setting = await Setting.findOne();
        if (!setting) { setting = await Setting.create({}); } // না থাকলে ডিফল্ট তৈরি করবে
        res.status(200).json({ success: true, data: setting });
    } catch (error) { next(error); }
};

// ডাটাবেসে সেটিংস সেভ বা আপডেট করা
exports.updateSettings = async (req, res, next) => {
    try {
        let setting = await Setting.findOne();
        if (!setting) {
            setting = await Setting.create(req.body);
        } else {
            setting = await Setting.findOneAndUpdate({}, req.body, { new: true });
        }
        res.status(200).json({ success: true, data: setting });
    } catch (error) { next(error); }
};