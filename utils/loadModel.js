const tf = require('@tensorflow/tfjs-node');

const modelUrls = {
  monthlyExpensePrediction: 'https://storage.googleapis.com/econome-models/monthly-expense-prediction/model.json',
  timeSeriesPrediction: 'https://storage.googleapis.com/econome-models/time-series-prediction/model.json',
  housing: 'https://storage.googleapis.com/econome-models/budgeting-category/housing/model.json',
  food: 'https://storage.googleapis.com/econome-models/budgeting-category/food/model.json',
  transportation: 'https://storage.googleapis.com/econome-models/budgeting-category/transportation/model.json',
  entertainment: 'https://storage.googleapis.com/econome-models/budgeting-category/entertainment/model.json',
  personal_care: 'https://storage.googleapis.com/econome-models/budgeting-category/personal_care/model.json',
  miscellaneous: 'https://storage.googleapis.com/econome-models/budgeting-category/miscellaneous/model.json',
};

const loadModel = async (modelName) => {
  try {
    const modelUrl = modelUrls[modelName];
    if (!modelUrl) {
      throw new Error(`Model URL for ${modelName} not found`);
    }
    const model = await tf.loadLayersModel(modelUrl);
    return model;
  } catch (error) {
    throw new Error(`Error loading the model: ${error.message}`);
  }
};

module.exports = { loadModel };
