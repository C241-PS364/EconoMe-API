const { loadModel } = require('../utils/loadModel');
const pool = require('../config/db');
const tf = require('@tensorflow/tfjs-node');

// Define the encoding and scaling parameters here
const mean = [21.5, 0.5, 2, 1568376];
const std = [2.3, 0.5, 1.5, 325291];
const genderEncoder = { 'Male': 0, 'Female': 1 };
const majorEncoder = { 'Biology': 0, 'Economics': 1, 'Computer Science': 2, 'Engineering': 3, 'Psychology': 4 };
const expenseMean = 1568376;
const expenseStd = 325291;

const scaleAndEncode = (age, gender, major, monthlyIncome) => {
  const scaledAge = (age - mean[0]) / std[0];
  const encodedGender = genderEncoder[gender];
  const encodedMajor = majorEncoder[major];
  const scaledIncome = (monthlyIncome - mean[3]) / std[3];
  return [scaledAge, encodedGender, encodedMajor, scaledIncome];
};

const predictExpense = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Fetch user data from database
    const userQuery = 'SELECT age, gender, major FROM users WHERE uuid = $1';
    const incomeQuery = 'SELECT COALESCE(SUM(amount), 0) as monthlyIncome FROM incomes WHERE user_uuid = $1 AND date >= date_trunc(\'month\', current_date)';
    
    const userResult = await pool.query(userQuery, [userId]);
    const incomeResult = await pool.query(incomeQuery, [userId]);

    if (!userResult.rows.length) {
      return res.status(400).json({ error: true, message: 'User data not found' });
    }

    const user = userResult.rows[0];
    let { monthlyincome } = incomeResult.rows[0];

    if (!monthlyincome) {
      return res.status(200).json({
        error: false,
        message: 'Prediction made successfully',
        predictedExpense: 0
      });
    }

    // Parse monthly income to an integer
    monthlyincome = parseInt(monthlyincome, 10);

    // console.log('User Data:', user);
    // console.log('Monthly Income:', monthlyincome);

    const model = await loadModel('monthlyExpensePrediction');

    const input = [user.age, user.gender, user.major, monthlyincome];
    const [scaledAge, encodedGender, encodedMajor, scaledIncome] = scaleAndEncode(...input);

    // console.log('Scaled and Encoded Input:', [scaledAge, encodedGender, encodedMajor, scaledIncome]);

    const inputTensor = tf.tensor2d([[scaledAge, encodedGender, encodedMajor, scaledIncome]], [1, 4]);

    const prediction = model.predict(inputTensor);
    let predictedExpense = prediction.dataSync()[0];

    // console.log('Raw Prediction Output:', predictedExpense);

    // Ensure the predicted expense is positive
    predictedExpense = Math.abs(predictedExpense);

    // Reverse scaling to get the original expense value
    const originalExpense = (predictedExpense * expenseStd) + expenseMean;

    // console.log('Scaled Predicted Expense:', originalExpense);

    res.status(200).json({
      error: false,
      message: 'Prediction made successfully',
      predictedExpense: Math.round((originalExpense + Number.EPSILON) * 100) / 100
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = {
  predictExpense
};
