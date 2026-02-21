const Meal = require('../models/Meal');
const Bazar = require('../models/Bazar');
const Deposit = require('../models/Deposit');
const Member = require('../models/Member');

exports.getMonthlyReport = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    const dateQuery = { date: { $gte: startDate, $lte: endDate } };

    // ১. মোট খরচ এবং মোট মিল
    const bazars = await Bazar.find(dateQuery);
    const totalExpense = bazars.reduce((sum, b) => sum + b.amount, 0);

    const meals = await Meal.find(dateQuery).populate('members', 'name');
    const totalMeals = meals.reduce((sum, m) => sum + m.totalMeals, 0);
    const mealRate = totalMeals > 0 ? (totalExpense / totalMeals) : 0;

    // ২. সব এক্টিভ মেম্বারদের লিস্ট তৈরি করা
    const allMembers = await Member.find({ isActive: true });
    const memberStats = {};
    
    allMembers.forEach(m => {
      memberStats[m._id.toString()] = { 
        memberId: m._id, name: m.name, room: m.room, totalMeals: 0, depositedAmount: 0 
      };
    });

    // ৩. মেম্বারদের মিল যোগ করা
    meals.forEach(meal => {
      meal.members.forEach(m => {
        if (memberStats[m._id.toString()]) memberStats[m._id.toString()].totalMeals += 1;
      });
    });

    // ৪. মেম্বারদের জমা টাকা (Deposit) যোগ করা
    const deposits = await Deposit.find(dateQuery);
    deposits.forEach(d => {
      if (memberStats[d.member.toString()]) memberStats[d.member.toString()].depositedAmount += d.amount;
    });

    // ৫. Payable এবং Balance হিসাব করা
    const memberDetails = Object.values(memberStats).map(m => {
      const payableAmount = Number((m.totalMeals * mealRate).toFixed(2));
      const balance = Number((m.depositedAmount - payableAmount).toFixed(2));
      return { ...m, payableAmount, balance };
    });

    res.status(200).json({
      success: true,
      data: { totalExpense, totalMeals, mealRate: Number(mealRate.toFixed(2)), members: memberDetails }
    });
  } catch (error) { next(error); }
};