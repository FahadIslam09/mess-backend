const Bazar = require('../models/Bazar');

// ১. বাজার অ্যাড করার ফাংশন (আগের)
exports.addBazar = async (req, res, next) => {
  try {
    const bazar = await Bazar.create(req.body);
    res.status(201).json({ success: true, data: bazar });
  } catch (error) { next(error); }
};

// ২. বাজার দেখার ফাংশন (আগের)
exports.getBazarsByMonth = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const bazars = await Bazar.find({ date: { $gte: startDate, $lte: endDate } }).sort({ date: 1 });
    res.status(200).json({ success: true, count: bazars.length, data: bazars });
  } catch (error) { next(error); }
};

// ৩. বাজার এডিট করার ফাংশন (নতুন)
exports.updateBazar = async (req, res, next) => {
  try {
    const bazar = await Bazar.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!bazar) return res.status(404).json({ success: false, message: 'Bazar entry not found' });
    res.status(200).json({ success: true, data: bazar });
  } catch (error) { next(error); }
};

// ৪. বাজার ডিলিট করার ফাংশন (নতুন)
exports.deleteBazar = async (req, res, next) => {
  try {
    const bazar = await Bazar.findByIdAndDelete(req.params.id);
    if (!bazar) return res.status(404).json({ success: false, message: 'Bazar entry not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) { next(error); }
};