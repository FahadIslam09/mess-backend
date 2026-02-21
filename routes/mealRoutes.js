const express = require('express');
const { addMeal, getMealsByMonth, getTotalMealCount, updateMeal, deleteMeal } = require('../controllers/mealController');
const router = express.Router();

router.route('/').post(addMeal).get(getMealsByMonth);
router.route('/count').get(getTotalMealCount);
router.route('/:id').put(updateMeal).delete(deleteMeal); // <-- নতুন লাইন

module.exports = router;