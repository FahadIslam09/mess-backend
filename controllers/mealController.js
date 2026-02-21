const Meal = require('../models/Meal');

exports.addMeal = async (req, res, next) => {
  try {
    const meal = await Meal.create(req.body);
    res.status(201).json({ success: true, data: meal });
  } catch (error) { next(error); }
};

exports.getMealsByMonth = async (req, res, next) => {
  try {
    const { year, month } = req.query; // Expecting month 1-12
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const meals = await Meal.find({ date: { $gte: startDate, $lte: endDate } }).populate('members', 'name room');
    res.status(200).json({ success: true, count: meals.length, data: meals });
  } catch (error) { next(error); }
};

exports.getTotalMealCount = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const meals = await Meal.find({ date: { $gte: startDate, $lte: endDate } });
    const total = meals.reduce((sum, meal) => sum + meal.totalMeals, 0);
    
    res.status(200).json({ success: true, totalMeals: total });
  } catch (error) { next(error); }
};