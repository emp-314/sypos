const mysql = require('mysql2/promise');
require('dotenv').config();

// Automatically use SSL for hosted databases (TiDB Cloud, Aiven, etc.).
// Local MySQL (localhost) usually runs without TLS.
const dbHost = process.env.DB_HOST || 'localhost';
const isLocal = dbHost.includes('localhost') || dbHost === '127.0.0.1';

// Create connection pool
const pool = mysql.createPool({
  host: dbHost,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pos_system',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ...(isLocal ? {} : { ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true } })
});

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✓ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { pool, testConnection };