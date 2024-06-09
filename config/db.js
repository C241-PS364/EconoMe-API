const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.INSTANCE_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

(async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('Connected to the database');
  } catch (err) {
    console.error('Failed to connect to the database', err);
    process.exit(-1);
  }
})();

// Handle idle client errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;
