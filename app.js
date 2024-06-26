const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/v1/auth');
const userRoutes = require('./routes/v1/user');
const incomesRouter = require('./routes/v1/incomes');
const categoryRouter = require('./routes/v1/category');
const expensesRouter = require('./routes/v1/expense');
const transactionRouter = require('./routes/v1/transaction');
const statisticRouter = require('./routes/v1/statistic');
const predictRouter = require('./routes/v1/predict');



dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


app.get('/', async (req, res) => {
  try {
    res.status(200).json({
      message: 'Welcome to the EconoMe API',
      version: '1.0.0',
      status: 'API is running',
    });
  } catch (err) {
    console.error('Error fetching server time:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/incomes', incomesRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/expenses', expensesRouter);
app.use('/api/v1/transactions', transactionRouter);
app.use('/api/v1/statistics', statisticRouter);
app.use('/api/v1/predict', predictRouter);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = app;
