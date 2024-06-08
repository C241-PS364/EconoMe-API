const moment = require('moment');
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

module.exports = {
  register,
};
