const express = require('express');
const { predictExpense } = require('../../controllers/monthlyPredictionController');
// const { anotherPrediction } = require('../../controllers/anotherPredictionController');
const authenticateToken = require('../../middleware/auth');

const router = express.Router();

router.get('/monthly-expense', authenticateToken, predictExpense);
// router.get('/another-prediction', authenticateToken, anotherPrediction);

module.exports = router;
