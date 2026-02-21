const express = require('express');
const { getMonthlyReport } = require('../controllers/reportController');
const router = express.Router();

router.route('/').get(getMonthlyReport);

module.exports = router;