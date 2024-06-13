const express = require('express');
const { getIncomeById, createIncome, updateIncome, deleteIncome } = require('../../controllers/incomesController');
const authenticateToken = require('../../middleware/auth');

const router = express.Router();

router.get('/:id', authenticateToken, getIncomeById);
router.post('/', authenticateToken, createIncome);
router.put('/:id', authenticateToken, updateIncome);
router.delete('/:id', authenticateToken, deleteIncome);

module.exports = router;