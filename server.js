
const express = require('express');
const pool = require('./config/db');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
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

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
