const Meal = require('../models/Meal');
const Bazar = require('../models/Bazar');
const Deposit = require('../models/Deposit');
const Member = require('../models/Member');
const Manager = require('../models/Manager');

exports.getMonthlyReport = async (req, res, next) => {
  try {
    const { startDate, endDate, year, month } = req.query;
    let dateQuery = {};
    let managerYear = year;
    let managerMonth = month;

    // ১. যদি ফ্রন্টএন্ড থেকে নতুন গ্লোবাল ডেট ফিল্টার (startDate, endDate) আসে
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        // শেষের দিনের রাত ১১:৫৯ পর্যন্ত ডেটা নেওয়ার জন্য
        end.setHours(23, 59, 59, 999);
        
        dateQuery = { date: { $gte: start, $lte: end } };
        
        // ম্যানেজার খোঁজার জন্য শুরুর তারিখের মাস ও বছর ব্যবহার করা হলো
        managerYear = start.getFullYear();
        managerMonth = start.getMonth() + 1; 
    } else {
        // ২. যদি আগের মত শুধু year এবং month দিয়ে রিকোয়েস্ট আসে (সেফটির জন্য রাখা হলো)
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);
        dateQuery = { date: { $gte: start, $lte: end } };
    }

    // ৩. নির্দিষ্ট মাসের ম্যানেজার খুঁজে বের করা
    const currentManager = await Manager.findOne({ year: managerYear, month: managerMonth });
    const managerId = currentManager ? currentManager.member.toString() : null;

    // ৪. মোট খরচ (Bazar থেকে)
    const bazars = await Bazar.find(dateQuery);
    const totalExpense = bazars.reduce((sum, b) => sum + b.amount, 0);

    // ৫. মেম্বারদের লিস্ট তৈরি 
    const allMembers = await Member.find({ isActive: true });
    const memberStats = {};
    allMembers.forEach(m => {
      memberStats[m._id.toString()] = { 
        memberId: m._id, name: m.name, room: m.room, totalMeals: 0, depositedAmount: 0 
      };
    });

    // ৬. মেম্বারদের মিল যোগ করা
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

    // ৭. মিল রেট হিসাব করা (ম্যানেজারের মিল বাদ দিয়ে)
    let totalPayableMeals = 0;
    Object.values(memberStats).forEach(m => {
      if (m.memberId.toString() !== managerId) { // ম্যানেজার না হলে মিল যোগ হবে
        totalPayableMeals += m.totalMeals; 
      }
    });
    
    const mealRate = totalPayableMeals > 0 ? (totalExpense / totalPayableMeals) : 0;

    // ৮. ডিপোজিট যোগ করা
    const deposits = await Deposit.find(dateQuery);
    deposits.forEach(d => {
      if (memberStats[d.member.toString()]) {
         memberStats[d.member.toString()].depositedAmount += d.amount;
      }
    });

    // ৯. Payable এবং Balance হিসাব করা
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