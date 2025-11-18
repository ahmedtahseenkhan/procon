const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'procon_gaming',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 20,
};

// Use connection string if provided, otherwise use individual config
const pool = new Pool(
  process.env.DATABASE_URL 
    ? { connectionString: process.env.DATABASE_URL }
    : dbConfig
);

// Test connection
pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err.message);
});
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Test query failed:', err.message);
  } else {
    console.log('✅ Database connected at:', res.rows[0].now);
  }
});
module.exports = { pool };
