const express = require('express');
const { getStatistics, getTopSpending } = require('../../controllers/statisticController');
const authenticateToken = require('../../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, getStatistics);
router.get('/top-spending', authenticateToken, getTopSpending);

module.exports = router;