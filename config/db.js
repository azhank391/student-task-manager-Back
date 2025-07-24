const { Sequelize } = require('sequelize');
const config = require('../config/config.js');

// Detect environment
const env = process.env.NODE_ENV || 'development';
let sequelize;

if (env === 'production') {
  // ✅ Use Railway DATABASE_URL
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  // ✅ Local development
  sequelize = new Sequelize(
    config.development.database,
    config.development.username,
    config.development.password,
    {
      host: config.development.host,
      dialect: config.development.dialect
    }
  );
}

// Test connection
sequelize.authenticate()
  .then(() => console.log(`✅ MySQL connected in ${env} mode`))
  .catch(err => console.error('❌ MySQL connection error:', err));

module.exports = sequelize;
