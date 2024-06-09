const moment = require('moment');
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET;

const register = async (req, res) => {
  const { username, password, name, date_of_birth, gender, job } = req.body;

  if (!username || !password || !name || !date_of_birth || !gender || !job) {
    return res.status(400).json({ error: true, message: 'All fields are required' });
  }

  const formattedDate = moment(date_of_birth, 'YYYY-MM-DD', true);
  if (!formattedDate.isValid()) {
    return res.status(400).json({ error: true, message: 'Invalid date format. Use YYYY-MM-DD' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (uuid, name, username, password, date_of_birth, gender, job) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)',
      [name, username, hashedPassword, formattedDate.format('YYYY-MM-DD'), gender, job]
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

    res.status(200).json({
      error: false,
      message: 'success',
      loginResult: {
        userId: user.uuid,
        name: user.name,
        token: token
      }
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = {
  register,
  login,
};