const express = require('express');
const {getProfile,  editProfile } = require('../../controllers/userController');
const authenticateToken = require('../../middleware/auth');

const router = express.Router();

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, editProfile);

module.exports = router;
