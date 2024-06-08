const express = require('express');
const pool = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/v1/auth');
const userRoutes = require('./routes/v1/user');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Routes registration with versioning
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = app;
