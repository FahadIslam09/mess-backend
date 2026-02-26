const Meal = require('../models/Meal');
const Bazar = require('../models/Bazar');
const Deposit = require('../models/Deposit');
const Member = require('../models/Member');
const Manager = require('../models/Manager');

exports.getMonthlyReport = async (req, res, next) => {
  try {
    // ফ্রন্টএন্ড থেকে আসা Settings এর ডেটাগুলো রিসিভ করা হচ্ছে
    const { startDate, endDate, year, month, calcMode, rateBreakfast, rateLunch, rateDinner, rateSehri, rateIftar } = req.query;
    
    let dateQuery = {};
    let managerYear = year;
    let managerMonth = month;

    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateQuery = { date: { $gte: start, $lte: end } };
        managerYear = start.getFullYear();
        managerMonth = start.getMonth() + 1; 
    } else {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);
        dateQuery = { date: { $gte: start, $lte: end } };
    }

    const currentManager = await Manager.findOne({ year: managerYear, month: managerMonth });
    const managerId = currentManager ? currentManager.member.toString() : null;

    const bazars = await Bazar.find(dateQuery);
    const totalExpense = bazars.reduce((sum, b) => sum + b.amount, 0);

    const allMembers = await Member.find({ isActive: true });
    const memberStats = {};
    allMembers.forEach(m => {
      memberStats[m._id.toString()] = { 
        memberId: m._id, name: m.name, room: m.room, totalMeals: 0, depositedAmount: 0,
        fixedTotalCost: 0 // ম্যাজিক: Fixed রেটের বিল জমানোর জন্য নতুন ফিল্ড
      };
    });

    // Fixed সিস্টেমের রেটগুলো সাজিয়ে নেওয়া
    const fixedRates = {
        Breakfast: Number(rateBreakfast) || 0,
        Lunch: Number(rateLunch) || 0,
        Dinner: Number(rateDinner) || 0,
        Sehri: Number(rateSehri) || 0,
        Iftar: Number(rateIftar) || 0
    };

    const meals = await Meal.find(dateQuery).populate('members', 'name');
    let totalMeals = 0; 
    meals.forEach(meal => {
      const costForThisMeal = fixedRates[meal.mealType] || 0; // এই বেলার জন্য কত টাকা চার্জ
      
      meal.members.forEach(m => {
        if (memberStats[m._id.toString()]) {
          memberStats[m._id.toString()].totalMeals += 1;
          memberStats[m._id.toString()].fixedTotalCost += costForThisMeal; // Fixed হলে সরাসরি টাকা যোগ হবে
          totalMeals += 1;
        }
      });
    });

    let totalPayableMeals = 0;
    Object.values(memberStats).forEach(m => {
      if (m.memberId.toString() !== managerId) { 
        totalPayableMeals += m.totalMeals; 
      }
    });
    
    const mealRate = totalPayableMeals > 0 ? (totalExpense / totalPayableMeals) : 0;
    const activeCalcMode = calcMode || 'average'; // ডিফল্ট Average

    const deposits = await Deposit.find(dateQuery);
    deposits.forEach(d => {
      if (memberStats[d.member.toString()]) {
         memberStats[d.member.toString()].depositedAmount += d.amount;
      }
    });

    // Payable এবং Balance হিসাব করা (Average vs Fixed)
    const memberDetails = Object.values(memberStats).map(m => {
      const isManager = m.memberId.toString() === managerId;
      let payableAmount = 0;

      if (!isManager) {
          if (activeCalcMode === 'fixed') {
              payableAmount = m.fixedTotalCost; // Fixed সিস্টেম হলে
          } else {
              payableAmount = Number((m.totalMeals * mealRate).toFixed(2)); // Average সিস্টেম হলে
          }
      }

      const balance = Number((m.depositedAmount - payableAmount).toFixed(2));
      return { ...m, isManager, payableAmount, balance };
    });

    res.status(200).json({
      success: true,
      data: { 
          totalExpense, 
          totalMeals, 
          mealRate: Number(mealRate.toFixed(2)), 
          calcMode: activeCalcMode,
          members: memberDetails, 
          managerId 
      }
    });
  } catch (error) { next(error); }
};