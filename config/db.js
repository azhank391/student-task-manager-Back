// config/database.js
const mysql = require('mysql2/promise');

// Database configuration using environment variables
const dbConfig = {
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  
  // Connection pool settings
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  
  // SSL Configuration (Railway requires SSL)
  ssl: {
    rejectUnauthorized: false
  },
  
  // Additional settings
  charset: 'utf8mb4',
  timezone: 'Z'
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
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
    
    // Test query
    const [rows] = await connection.execute('SELECT DATABASE() as db_name, NOW() as server_time');
    console.log('✅ Database test successful:', rows[0]);
    
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    console.error('🔍 Check these environment variables:');
    console.error('- MYSQL_HOST:', process.env.MYSQL_HOST ? '✅ Set' : '❌ Missing');
    console.error('- MYSQL_PORT:', process.env.MYSQL_PORT ? '✅ Set' : '❌ Missing');
    console.error('- MYSQL_USER:', process.env.MYSQL_USER ? '✅ Set' : '❌ Missing');
    console.error('- MYSQL_PASSWORD:', process.env.MYSQL_PASSWORD ? '✅ Set' : '❌ Missing');
    console.error('- MYSQL_DATABASE:', process.env.MYSQL_DATABASE ? '✅ Set' : '❌ Missing');
    return false;
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Closing database connection pool...');
  await pool.end();
  process.exit(0);
});

module.exports = { 
  pool, 
  testConnection, 
  createTables 
};