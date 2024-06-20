const { loadModel } = require('../utils/loadModel');
const pool = require('../config/db');
const tf = require('@tensorflow/tfjs-node');

// Mapping of database category names to model category names
const categoryMapping = {
  Housing: 'housing',
  Food: 'food',
  Transportation: 'transportation',
  Entertainment: 'entertainment',
  'Personal-Care': 'personal_care',
  Miscellaneous: 'miscellaneous'
};

// Define the encoding and scaling parameters here (example values, adjust accordingly)
const mean = {
  housing: 62937.003000,
  food: 41121.541000,
  transportation: 20286.413000,
  entertainment: 27609.505000,
  personal_care: 9879.368000,
  miscellaneous: 17726.570000
};

const std = {
  housing: 15482.710702,
  food: 14152.615173,
  transportation: 7089.833371,
  entertainment: 12360.773264,
  personal_care: 3727.053262,
  miscellaneous: 8531.028999
};

// normalize the data
const normalizeData = (data, category) => {
  return data.map(value => (value - mean[category]) / std[category]);
};

// inverse normalize the data
const inverseNormalize = (value, category) => {
  return (value * std[category]) + mean[category];
};

const predictBudget = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { category } = req.params;

    const modelCategory = categoryMapping[category];

    if (!modelCategory) {
      return res.status(400).json({ error: true, message: 'Invalid category name' });
    }

    const categoryQuery = 'SELECT id FROM categories WHERE name = $1';
    const categoryResult = await pool.query(categoryQuery, [category.replace('-', ' ')]);

    if (!categoryResult.rows.length) {
      return res.status(400).json({ error: true, message: 'Category not found' });
    }

    const categoryId = categoryResult.rows[0].id;

    const incomeQuery = 'SELECT COALESCE(SUM(amount), 0) as monthlyIncome FROM incomes WHERE user_uuid = $1 AND date >= date_trunc(\'month\', current_date)';
    const expenseQuery = `
      SELECT e.date, e.amount 
      FROM expenses e
      WHERE e.user_uuid = $1 AND e.category_id = $2
      ORDER BY e.date`;

    const incomeResult = await pool.query(incomeQuery, [userId]);
    const expenseResult = await pool.query(expenseQuery, [userId, categoryId]);

    const monthlyIncome = parseInt(incomeResult.rows[0].monthlyincome, 10);
    const expenses = expenseResult.rows.map(row => parseFloat(row.amount));

    if (expenses.length < 7) {
      return res.status(400).json({ error: true, message: 'Not enough data to make a prediction' });
    }

    // Load the model for the specific category
    const model = await loadModel(modelCategory);

    // Normalize the data
    const normalizedExpenses = normalizeData(expenses.slice(-7), modelCategory);

    // Prepare data for prediction
    const inputTensor = tf.tensor3d([normalizedExpenses.map(value => [value])], [1, 7, 1]);

    // Make prediction
    const prediction = model.predict(inputTensor);
    let predictedExpense = prediction.dataSync()[0];

    // Ensure the predicted expense is positive
    predictedExpense = Math.abs(predictedExpense);

    // Reverse scaling to get the original expense value
    const originalExpense = inverseNormalize(predictedExpense, modelCategory);

    res.status(200).json({
      error: false,
      message: 'Budget prediction made successfully',
      category,
      predictedExpense: Math.round((originalExpense + Number.EPSILON) * 100) / 100
    });
  } catch (error) {
    console.error('Error during budget prediction:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = {
  predictBudget
};
