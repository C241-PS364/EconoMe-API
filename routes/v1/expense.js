const express = require('express');
const { createExpense, updateExpense } = require('../../controllers/expenseController');
const authenticateToken = require('../../middleware/auth');

const router = express.Router();

router.post('/', authenticateToken, createExpense);
router.put('/:id', authenticateToken, updateExpense);


module.exports = router;