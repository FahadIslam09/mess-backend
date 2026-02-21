const Member = require('../models/Member');

exports.addMember = async (req, res, next) => {
  try {
    const member = await Member.create(req.body);
    res.status(201).json({ success: true, data: member });
  } catch (error) { next(error); }
};

exports.getMembers = async (req, res, next) => {
  try {
    const members = await Member.find().sort({ name: 1 });
    res.status(200).json({ success: true, count: members.length, data: members });
  } catch (error) { next(error); }
};

exports.updateMember = async (req, res, next) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.status(200).json({ success: true, data: member });
  } catch (error) { next(error); }
};

exports.deleteMember = async (req, res, next) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) { next(error); }
};