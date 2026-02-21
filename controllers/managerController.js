const Manager = require('../models/Manager');

exports.setManager = async (req, res, next) => {
  try {
    const { member, year, month } = req.body;
    let manager = await Manager.findOne({ year, month });
    
    // যদি এই মাসের ম্যানেজার আগে থেকেই থাকে, তাহলে আপডেট হবে। না থাকলে নতুন তৈরি হবে।
    if (manager) {
      manager.member = member;
      await manager.save();
    } else {
      manager = await Manager.create({ member, year, month });
    }
    res.status(200).json({ success: true, data: manager });
  } catch (error) { next(error); }
};

exports.getManager = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const manager = await Manager.findOne({ year, month }).populate('member', 'name');
    res.status(200).json({ success: true, data: manager });
  } catch (error) { next(error); }
};