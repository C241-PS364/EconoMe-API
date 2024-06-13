const moment = require('moment');
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { addToBlacklist } = require('../config/blacklist');
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

const register = async (req, res) => {
  const { username, password, name, gender, major, age } = req.body;

  if (!username || !password || !name || !gender || !major || !age) {
    return res.status(400).json({ error: true, message: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (uuid, name, username, password, gender, major, age) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)',
      [name, username, hashedPassword, gender, major, age]
    );
    res.status(201).json({ error: false, message: 'User Created' });
  } catch (error) {
    if (error.code === '23505' && error.constraint === 'users_username_key') {
      res.status(409).json({ error: true, message: 'Username already exists' });
    } else {
      res.status(500).json({ error: true, message: error.message });
    }
  }
};


const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: true, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: true, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.uuid }, jwtSecret, { expiresIn: process.env.JWT_EXPIRATION_ACCESS });
    const refreshToken = jwt.sign({ userId: user.uuid }, jwtRefreshSecret, { expiresIn: process.env.JWT_EXPIRATION_REFRESH });

    res.status(200).json({
      error: false,
      message: 'success',
      loginResult: {
        userId: user.uuid,
        name: user.name,
        token: token,
        refreshToken: refreshToken
      }
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};


const refresh = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token is required' });
  }

  try {
    const payload = jwt.verify(refreshToken, jwtRefreshSecret);
    const newToken = jwt.sign({ userId: payload.userId }, jwtSecret, { expiresIn: process.env.JWT_EXPIRATION_ACCESS });

    res.status(200).json({ token: newToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

const logout = (req, res) => {
  const token = req.headers['authorization'].split(' ')[1];

  // Add token to blacklist with a 24-hour expiration
  addToBlacklist(token, 24 * 3600); // 24 hours in seconds

  res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = {
  register,
  login,
  logout,
  refresh,
};