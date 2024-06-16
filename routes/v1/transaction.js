const express = require('express');
const { getTransactions, getTopSpending } = require('../../controllers/transactionController');
const authenticateToken = require('../../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, getTransactions);
router.get('/top-spending', authenticateToken, getTopSpending);

module.exports = router;