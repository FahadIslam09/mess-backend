const Deposit = require('../models/Deposit');

exports.addDeposit = async (req, res, next) => {
  try {
    const deposit = await Deposit.create(req.body);
    res.status(201).json({ success: true, data: deposit });
  } catch (error) { next(error); }
};

exports.getDepositsByMonth = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const deposits = await Deposit.find({ date: { $gte: startDate, $lte: endDate } }).populate('member', 'name room');
    res.status(200).json({ success: true, count: deposits.length, data: deposits });
  } catch (error) { next(error); }
};

exports.deleteDeposit = async (req, res, next) => {
  try {
    const deposit = await Deposit.findByIdAndDelete(req.params.id);
    if (!deposit) return res.status(404).json({ success: false, message: 'Deposit not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) { next(error); }
};