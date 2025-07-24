const { Sequelize } = require("sequelize");

let sequelize;

if (process.env.NODE_ENV === "production") {
  console.log("🚀 Running in PRODUCTION mode with Railway MySQL...");

  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      dialect: "mysql",
      logging: false,
      dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false } // Railway requires SSL
      }
    }
  );

} else {
  console.log("🚀 Running in DEVELOPMENT mode with local MySQL...");

  const devConfig = require("../config/config.js").development;
  sequelize = new Sequelize(
    devConfig.database,
    devConfig.username,
    devConfig.password,
    {
      host: devConfig.host,
      dialect: devConfig.dialect,
      port: 3306,
      logging: false
    }
  );
}

// ✅ Test DB connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL connection established");
  } catch (err) {
    console.error("❌ MySQL connection failed:", err.message);
  }
})();

module.exports = sequelize;
