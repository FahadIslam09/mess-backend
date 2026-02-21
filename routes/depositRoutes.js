const express = require('express');
const { addDeposit, getDepositsByMonth, deleteDeposit } = require('../controllers/depositController');
const router = express.Router();

router.route('/').post(addDeposit).get(getDepositsByMonth);
router.route('/:id').delete(deleteDeposit);

module.exports = router;