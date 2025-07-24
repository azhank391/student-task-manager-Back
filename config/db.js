const { Sequelize } = require("sequelize");

let sequelize;
const dbUrl = `mysql://${process.env.MYSQLUSER}:${process.env.MYSQLDBPASSWORD}@${process.env.MYSQLDBHOST}:${process.env.MYSQLDBPORT}/${process.env.MYSQLDBNAME}`;
if (process.env.NODE_ENV === "production") {
  console.log("🚀 Running in PRODUCTION mode with Railway MySQL...");

  sequelize = new Sequelize(dbUrl, {
      host: process.env.MYSQLDBHOST,
      port: process.env.MYSQLDBPORT || 3306,
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
