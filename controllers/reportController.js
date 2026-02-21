const Meal = require('../models/Meal');
const Bazar = require('../models/Bazar');

exports.getMonthlyReport = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ success: false, message: 'Please provide year and month' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    const dateQuery = { date: { $gte: startDate, $lte: endDate } };

    // 1. Calculate Total Expense
    const bazars = await Bazar.find(dateQuery);
    const totalExpense = bazars.reduce((sum, b) => sum + b.amount, 0);

    // 2. Calculate Total Meals
    const meals = await Meal.find(dateQuery).populate('members', 'name room');
    const totalMeals = meals.reduce((sum, m) => sum + m.totalMeals, 0);

    // 3. Calculate Meal Rate
    const mealRate = totalMeals > 0 ? (totalExpense / totalMeals) : 0;

    // 4. Calculate Per Member Stats
    const memberStats = {};
    
    meals.forEach(meal => {
      meal.members.forEach(member => {
        const id = member._id.toString();
        if (!memberStats[id]) {
          memberStats[id] = {
            memberId: id,
            name: member.name,
            room: member.room,
            totalMeals: 0
          };
        }
        memberStats[id].totalMeals += 1;
      });
    });

    // Calculate payable amount for each member
    const memberDetails = Object.values(memberStats).map(m => ({
      ...m,
      payableAmount: Number((m.totalMeals * mealRate).toFixed(2))
    }));

    res.status(200).json({
      success: true,
      data: {
        totalExpense,
        totalMeals,
        mealRate: Number(mealRate.toFixed(2)),
        members: memberDetails
      }
    });

  } catch (error) { next(error); }
};