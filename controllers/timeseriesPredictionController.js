const { loadModel } = require('../utils/loadModel');
const tf = require('@tensorflow/tfjs-node');
const pool = require('../config/db');

const SEQUENCE_LENGTH = 7; // Define the sequence length here

// Function to fetch expense data for a given period
const fetchExpenseData = async (userUuid, startDate, endDate) => {
  const query = `
    SELECT date, amount
    FROM expenses
    WHERE user_uuid = $1 AND date BETWEEN $2 AND $3
    ORDER BY date ASC
  `;
  const result = await pool.query(query, [userUuid, startDate, endDate]);
  return result.rows;
};

// Function to clean and normalize the data
const cleanAndNormalizeData = (data) => {
  const expenses = data.map(row => parseFloat(row.amount));
  const min = Math.min(...expenses);
  const max = Math.max(...expenses);
  const normalizedExpenses = expenses.map(val => (val - min) / (max - min));
  return { normalizedExpenses, min, max };
};

// Function to inverse normalize the data
const inverseNormalize = (value, min, max) => {
  return value * (max - min) + min;
};

// Function to preprocess the data for the model
const preprocessData = (data, sequenceLength) => {
  const sequences = [];
  for (let i = 0; i <= data.length - sequenceLength; i++) {
    const sequence = data.slice(i, i + sequenceLength);
    sequences.push(sequence);
  }
  const shape = [sequences.length, sequenceLength, 1];
  return tf.tensor3d(sequences.map(seq => seq.map(val => [val])), shape);
};

// Function to forecast the next day
const forecastNextDay = (model, series, windowSize, min, max) => {
  const lastWindow = series.slice(-windowSize);
  const lastWindowTensor = tf.tensor3d([lastWindow.map(val => [val])], [1, windowSize, 1]);
  const nextPrediction = model.predict(lastWindowTensor);
  const nextPredictionScaled = nextPrediction.dataSync()[0];
  return inverseNormalize(nextPredictionScaled, min, max);
};

// Function to calculate the sum of the first N predictions
const calculateForecastSum = (predictions, numDays) => {
  return predictions.slice(0, numDays).reduce((acc, val) => acc + val, 0);
};

const predictTimeSeries = async (req, res) => {
  try {
    const userUuid = req.user.userId;
    const { startDate, endDate } = req.body; // Remove sequenceLength from the request body

    // Fetch the user's expense data
    const expenseData = await fetchExpenseData(userUuid, startDate, endDate);
    if (expenseData.length < SEQUENCE_LENGTH) { // Use SEQUENCE_LENGTH directly
      return res.status(400).json({ error: true, message: 'Not enough data to make a prediction' });
    }

    // Clean and normalize the data
    const { normalizedExpenses, min, max } = cleanAndNormalizeData(expenseData);

    // Prepare the data for prediction
    const inputTensor = tf.tensor3d([normalizedExpenses.slice(-SEQUENCE_LENGTH).map(val => [val])], [1, SEQUENCE_LENGTH, 1]);

    // Load the model
    const model = await loadModel('timeSeriesPrediction');

    // Make the prediction for the input data
    const prediction = model.predict(inputTensor);
    const predictTimeSeriesScaled = prediction.dataSync();
    const predictTimeSeries = predictTimeSeriesScaled.map(val => inverseNormalize(val, min, max));

    // Forecast the next day
    const nextDayPrediction = forecastNextDay(model, normalizedExpenses, SEQUENCE_LENGTH, min, max);

    // Calculate the weekly and monthly forecasts
    const weeklyForecast = calculateForecastSum(predictTimeSeries, 7);
    const monthlyForecast = calculateForecastSum(predictTimeSeries, 30);

    res.status(200).json({
      error: false,
      message: 'Prediction made successfully',
      nextDayPrediction: nextDayPrediction.toFixed(2),
      weeklyForecast: weeklyForecast.toFixed(2),
      monthlyForecast: monthlyForecast.toFixed(2)
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = {
  predictTimeSeries
};