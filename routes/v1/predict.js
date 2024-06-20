const express = require('express');
const { predictExpense } = require('../../controllers/monthlyPredictionController');
const { predictTimeSeries } = require('../../controllers/timeseriesPredictionController');
const { predictBudget } = require('../../controllers/budgetPredictionController');
const authenticateToken = require('../../middleware/auth');

const router = express.Router();

router.get('/monthly-expense', authenticateToken, predictExpense);
router.get('/timeseries-expense', authenticateToken, predictTimeSeries);
router.get('/budget-prediction/:category', authenticateToken, predictBudget);


module.exports = router;
