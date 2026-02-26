const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settingController');
const router = express.Router();

// GET রিকোয়েস্ট দিয়ে সেটিংস দেখাবে এবং POST রিকোয়েস্ট দিয়ে সেটিংস আপডেট করবে
router.route('/').get(getSettings).post(updateSettings);

module.exports = router;