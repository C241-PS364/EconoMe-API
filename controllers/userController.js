
const pool = require('../config/db');
require('dotenv').config();

const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await pool.query('SELECT id, uuid, name, username, gender, major, age, created_at, updated_at FROM users WHERE uuid = $1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }
    res.status(200).json({
      error: false,
      message: 'Profile fetched successfully',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const editProfile = async (req, res) => {
  const { name, username, gender, major, age } = req.body;
  const userId = req.user.userId;

  if (!name || !username || !gender || !major || !age) {
    return res.status(400).json({ error: true, message: 'All fields are required' });
  }

  try {
    const result = await pool.query(
      'UPDATE users SET name = $1, username = $2, gender = $3, major = $4, age = $5, updated_at = NOW() WHERE uuid = $6 RETURNING id, uuid, name, username, gender, major, created_at, updated_at, age',
      [name, username, gender, major, age, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }

    res.status(200).json({
      error: false,
      message: 'Profile updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505' && error.constraint === 'users_username_key') {
      res.status(409).json({ error: true, message: 'Username already exists' });
    } else {
      res.status(500).json({ error: true, message: error.message });
    }
  }
};

  module.exports = {
    getProfile,
    editProfile,
  };