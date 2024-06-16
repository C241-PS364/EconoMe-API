const express = require('express');
const { getTopSpending } = require('../../controllers/statisticController');
const authenticateToken = require('../../middleware/auth');

const router = express.Router();

router.get('/top-spending', authenticateToken, getTopSpending);

module.exports = router;