const tf = require('@tensorflow/tfjs-node');

const modelUrls = {
  monthlyExpensePrediction: 'https://storage.googleapis.com/econome-models/monthly-expense-prediction/model.json',
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
