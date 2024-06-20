const express = require('express');
const { predictExpense } = require('../../controllers/monthlyPredictionController');
const { predictTimeSeries } = require('../../controllers/timeseriesPredictionController');
const authenticateToken = require('../../middleware/auth');

const router = express.Router();

router.get('/monthly-expense', authenticateToken, predictExpense);
router.get('/timeseries-expense', authenticateToken, predictTimeSeries);

module.exports = router;
