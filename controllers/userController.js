
const pool = require('../config/db');
require('dotenv').config();


const editProfile = async (req, res) => {
    const { name, username, date_of_birth, gender, job } = req.body;
    const userId = req.user.userId;
  
    if (!name || !username || !date_of_birth || !gender || !job) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    try {
      const result = await pool.query(
        'UPDATE users SET name = $1, username = $2, date_of_birth = $3, gender = $4, job = $5, updated_at = NOW() WHERE uuid = $6 RETURNING id, uuid, name, username, date_of_birth, gender, job, created_at, updated_at',
        [name, username, date_of_birth, gender, job, userId]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.status(200).json(result.rows[0]);
    } catch (error) {
      if (error.code === '23505' && error.constraint === 'users_username_key') {
        res.status(409).json({ error: 'Username already exists' });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  };

  module.exports = {
    editProfile,
  };