const moment = require('moment');
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET;


const register = async (req, res) => {
  const { username, password, name, date_of_birth, gender, job } = req.body;

  if (!username || !password || !name || !date_of_birth || !gender || !job) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const formattedDate = moment(date_of_birth, 'YYYY-MM-DD', true);
  if (!formattedDate.isValid()) {
    return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (uuid, name, username, password, date_of_birth, gender, job) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6) RETURNING *',
      [name, username, hashedPassword, formattedDate.format('YYYY-MM-DD'), gender, job]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505' && error.constraint === 'users_username_key') {
      res.status(409).json({ error: 'Username already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Query the database to get the hashed password for the given username
    const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const storedHashedPassword = user.rows[0].password;
    const passwordMatch = await bcrypt.compare(password, storedHashedPassword);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.rows[0].uuid }, jwtSecret, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await pool.query('SELECT id, uuid, name, username, date_of_birth, gender, job, created_at, updated_at FROM users WHERE uuid = $1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  getProfile
};