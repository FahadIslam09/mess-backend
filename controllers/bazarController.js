const Bazar = require('../models/Bazar');

// ১. বাজার অ্যাড করার ফাংশন
exports.addBazar = async (req, res, next) => {
  try {
    const bazar = await Bazar.create(req.body);
    res.status(201).json({ success: true, data: bazar });
  } catch (error) { next(error); }
};

// ২. বাজার দেখার ফাংশন (আপডেট করা হয়েছে)
exports.getBazarsByMonth = async (req, res, next) => {
  try {
    const { startDate, endDate, year, month } = req.query;
    let dateQuery = {};

    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateQuery = { date: { $gte: start, $lte: end } };
    } else {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);
        dateQuery = { date: { $gte: start, $lte: end } };
    }

    // ম্যাজিক: populate('shopper') দিয়ে বাজারের সাথে মেম্বারের নাম ও রুম নাম্বার যুক্ত করে দেওয়া হচ্ছে
    const bazars = await Bazar.find(dateQuery)
                              .populate('shopper', 'name room')
                              .sort({ date: 1 });
                              
    res.status(200).json({ success: true, count: bazars.length, data: bazars });
  } catch (error) { next(error); }
};

// ৩. বাজার এডিট করার ফাংশন
exports.updateBazar = async (req, res, next) => {
  try {
    const bazar = await Bazar.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!bazar) return res.status(404).json({ success: false, message: 'Bazar entry not found' });
    res.status(200).json({ success: true, data: bazar });
  } catch (error) { next(error); }
};

// ৪. বাজার ডিলিট করার ফাংশন
exports.deleteBazar = async (req, res, next) => {
  try {
    const bazar = await Bazar.findByIdAndDelete(req.params.id);
    if (!bazar) return res.status(404).json({ success: false, message: 'Bazar entry not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) { next(error); }
};