const express = require('express');
const { getExpenses, createExpense, updateExpense, deleteExpense } = require('../../controllers/expenseController');
const authenticateToken = require('../../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, getExpenses);
router.post('/', authenticateToken, createExpense);
router.put('/:id', authenticateToken, updateExpense);
router.delete('/:id', authenticateToken, deleteExpense);


module.exports = router;