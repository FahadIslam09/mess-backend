const express = require('express');
const { addBazar, getBazarsByMonth, updateBazar, deleteBazar } = require('../controllers/bazarController');
const router = express.Router();

router.route('/').post(addBazar).get(getBazarsByMonth);
router.route('/:id').put(updateBazar).delete(deleteBazar); // <-- এই লাইনটি নতুন যুক্ত হলো

module.exports = router;