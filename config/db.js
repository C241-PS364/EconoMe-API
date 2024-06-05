const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

const User = require('./userModel');
const Category = require('./categoryModel');
const Expense = require('./expenseModel');
const Income = require('./incomeModel');

const models = {
  User,
  Category,
  Expense,
  Income,
};

const initializeModels = () => {
  Object.keys(models).forEach((modelName) => {
    if (models[modelName].associate) {
      models[modelName].associate(models);
    }
  });
};

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Connected...');
    await sequelize.sync({ force: false });
    console.log('Database synchronized');
  } catch (err) {
    console.error('Unable to connect to the database:', err);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  models,
  connectDB,
  initializeModels,
};