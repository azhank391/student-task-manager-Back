const { Sequelize } = require('sequelize');
const config = require('./config.json')['development'];

// Initialize Sequelize using config
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
  }
);

// Test connection
sequelize.authenticate()
  .then(() => {
    console.log('✅ MySQL connection has been established successfully.');
  })
  .catch((err) => {
    console.error('❌ Unable to connect to the MySQL database:', err);
  });

module.exports = sequelize;

