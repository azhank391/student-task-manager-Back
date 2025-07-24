const { Sequelize } = require("sequelize");

let config;
if (process.env.NODE_ENV === "production") {
  config = {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "mysql",
  };
} else {
  config = require("../config/config.js").development;
}

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  logging: false
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL connection established");
  } catch (err) {
    console.error("❌ MySQL connection failed (but server will still run):", err.message);
  }
})();

module.exports = sequelize;
