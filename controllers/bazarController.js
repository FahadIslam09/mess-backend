const Bazar = require('../models/Bazar');

exports.addBazar = async (req, res, next) => {
  try {
    const bazar = await Bazar.create(req.body);
    res.status(201).json({ success: true, data: bazar });
  } catch (error) { next(error); }
};

exports.getBazarByMonth = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const bazars = await Bazar.find({ date: { $gte: startDate, $lte: endDate } }).sort({ date: -1 });
    res.status(200).json({ success: true, count: bazars.length, data: bazars });
  } catch (error) { next(error); }
};

exports.deleteBazar = async (req, res, next) => {
  try {
    const bazar = await Bazar.findByIdAndDelete(req.params.id);
    if (!bazar) return res.status(404).json({ success: false, message: 'Bazar entry not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) { next(error); }
};