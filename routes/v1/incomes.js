const express = require('express');
const { getAllIncomes, getMonthlyIncomes, getIncomeById, createIncome, updateIncome, deleteIncome } = require('../../controllers/incomeController');
const authenticateToken = require('../../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, getAllIncomes);
router.get('/monthly/:year/:month', authenticateToken, getMonthlyIncomes);
router.get('/:id', authenticateToken, getIncomeById);
router.post('/', authenticateToken, createIncome);
router.put('/:id', authenticateToken, updateIncome);
router.delete('/:id', authenticateToken, deleteIncome);

module.exports = router;