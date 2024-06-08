const express = require('express');
const { getProfile } = require('../../controllers/authController');
const authenticateToken = require('../../middleware/auth');

const router = express.Router();

router.get('/profile', authenticateToken, getProfile);

module.exports = router;
