const express = require('express');
const { addMeal, getMealsByMonth, getTotalMealCount } = require('../controllers/mealController');
const router = express.Router();

router.route('/').post(addMeal).get(getMealsByMonth);
router.route('/count').get(getTotalMealCount);

module.exports = router;