const express = require('express');
const { setManager, getManager } = require('../controllers/managerController');
const router = express.Router();

router.route('/').post(setManager).get(getManager);

module.exports = router;