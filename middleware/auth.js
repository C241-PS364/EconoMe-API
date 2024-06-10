const jwt = require('jsonwebtoken');
const { isBlacklisted } = require('../config/blacklist');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: true, message: 'Token missing' });
  }

  if (isBlacklisted(token)) {
    return res.status(403).json({ error: true, message: 'Token is blacklisted' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ error: true, message: 'Token expired' });
      } else if (err.name === 'JsonWebTokenError') {
        return res.status(403).json({ error: true, message: 'Invalid token' });
      } else {
        return res.status(403).json({ error: true, message: 'Token verification failed' });
      }
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
