const express = require('express');
const { addBazar, getBazarByMonth, deleteBazar } = require('../controllers/bazarController');
const router = express.Router();

router.route('/').post(addBazar).get(getBazarByMonth);
router.route('/:id').delete(deleteBazar);

module.exports = router;