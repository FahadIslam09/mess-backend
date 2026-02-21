const express = require('express');
const { addMember, getMembers, updateMember, deleteMember } = require('../controllers/memberController');
const router = express.Router();

router.route('/').get(getMembers).post(addMember);
router.route('/:id').put(updateMember).delete(deleteMember);

module.exports = router;