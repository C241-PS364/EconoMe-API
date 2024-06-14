const express = require('express');
const { createExpense } = require('../../controllers/expenseController');
const authenticateToken = require('../../middleware/auth');

const router = express.Router();

router.post('/', authenticateToken, createExpense);

module.exports = router;