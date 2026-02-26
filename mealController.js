const Meal = require('../models/Meal');

exports.addMeal = async (req, res, next) => {
  try {
    const meal = await Meal.create(req.body);
    res.status(201).json({ success: true, data: meal });
  } catch (error) { next(error); }
};

exports.getMealsByMonth = async (req, res, next) => {
  try {
    const { startDate, endDate, year, month } = req.query;
    let dateQuery = {};

    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateQuery = { date: { $gte: start, $lte: end } };
    } else {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);
        dateQuery = { date: { $gte: start, $lte: end } };
    }

    const meals = await Meal.find(dateQuery).populate('members', 'name room');
    res.status(200).json({ success: true, count: meals.length, data: meals });
  } catch (error) { next(error); }
};

exports.getTotalMealCount = async (req, res, next) => {
  try {
    const { startDate, endDate, year, month } = req.query;
    let dateQuery = {};

    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateQuery = { date: { $gte: start, $lte: end } };
    } else {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);
        dateQuery = { date: { $gte: start, $lte: end } };
    }

    const meals = await Meal.find(dateQuery);
    const total = meals.reduce((sum, meal) => sum + meal.totalMeals, 0);
    
    res.status(200).json({ success: true, totalMeals: total });
  } catch (error) { next(error); }
};

exports.updateMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) return res.status(404).json({ success: false, message: 'Meal not found' });

    meal.mealType = req.body.mealType || meal.mealType;
    meal.members = req.body.members || meal.members;
    
    await meal.save();
    res.status(200).json({ success: true, data: meal });
  } catch (error) { next(error); }
};

exports.deleteMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findByIdAndDelete(req.params.id);
    if (!meal) return res.status(404).json({ success: false, message: 'Meal not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) { next(error); }
};