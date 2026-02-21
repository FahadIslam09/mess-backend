const Meal = require('../models/Meal');
const Bazar = require('../models/Bazar');
const Deposit = require('../models/Deposit');
const Member = require('../models/Member');
const Manager = require('../models/Manager'); // নতুন যুক্ত হলো

exports.getMonthlyReport = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    const dateQuery = { date: { $gte: startDate, $lte: endDate } };

    // ১. নির্দিষ্ট মাসের ম্যানেজার খুঁজে বের করা
    const currentManager = await Manager.findOne({ year, month });
    const managerId = currentManager ? currentManager.member.toString() : null;

    // ২. মোট খরচ
    const bazars = await Bazar.find(dateQuery);
    const totalExpense = bazars.reduce((sum, b) => sum + b.amount, 0);

    // ৩. মেম্বারদের লিস্ট তৈরি 
    const allMembers = await Member.find({ isActive: true });
    const memberStats = {};
    allMembers.forEach(m => {
      memberStats[m._id.toString()] = { 
        memberId: m._id, name: m.name, room: m.room, totalMeals: 0, depositedAmount: 0 
      };
    });

    // ৪. মেম্বারদের মিল যোগ করা
    const meals = await Meal.find(dateQuery).populate('members', 'name');
    let totalMeals = 0; 
    meals.forEach(meal => {
      meal.members.forEach(m => {
        if (memberStats[m._id.toString()]) {
          memberStats[m._id.toString()].totalMeals += 1;
          totalMeals += 1;
        }
      });
    });

    // ৫. মিল রেট হিসাব করা (ম্যানেজারের মিল বাদ দিয়ে)
    let totalPayableMeals = 0;
    Object.values(memberStats).forEach(m => {
      if (m.memberId.toString() !== managerId) { // ম্যানেজার না হলে মিল যোগ হবে
        totalPayableMeals += m.totalMeals; 
      }
    });
    
    const mealRate = totalPayableMeals > 0 ? (totalExpense / totalPayableMeals) : 0;

    // ৬. ডিপোজিট যোগ করা
    const deposits = await Deposit.find(dateQuery);
    deposits.forEach(d => {
      if (memberStats[d.member.toString()]) memberStats[d.member.toString()].depositedAmount += d.amount;
    });

    // ৭. Payable এবং Balance হিসাব করা
    const memberDetails = Object.values(memberStats).map(m => {
      const isManager = m.memberId.toString() === managerId;
      const payableAmount = isManager ? 0 : Number((m.totalMeals * mealRate).toFixed(2));
      const balance = Number((m.depositedAmount - payableAmount).toFixed(2));
      return { ...m, isManager, payableAmount, balance };
    });

    res.status(200).json({
      success: true,
      data: { totalExpense, totalMeals, mealRate: Number(mealRate.toFixed(2)), members: memberDetails, managerId }
    });
  } catch (error) { next(error); }
};