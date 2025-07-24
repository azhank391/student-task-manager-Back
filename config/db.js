// config/database.js
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  // ✅ correct timeout option
  connectTimeout: 60000,

  ssl: {
    rejectUnauthorized: false
  },

  charset: 'utf8mb4',
  timezone: 'Z'
};

const pool = mysql.createPool(dbConfig);

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...');
    console.log('📍 Connecting to:', {
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT,
      user: process.env.MYSQL_USER,
      database: process.env.MYSQL_DATABASE
    });

    const connection = await pool.getConnection();
    console.log('✅ MySQL Connected to Railway Database');

    const [rows] = await connection.execute('SELECT DATABASE() as db_name, NOW() as server_time');
    console.log('✅ Database test successful:', rows[0]);

    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    console.error('🔍 Check env variables: MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE');
    return false;
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Closing database connection pool...');
  await pool.end();
  process.exit(0);
});

module.exports = { pool, testConnection };
