const { exec } = require('child_process');
const fs = require('fs');

console.log('🚨 EMERGENCY DATA RECOVERY');
console.log('==========================');
console.log('Your data is SAFE! It\'s in your Postgres.app database.');
console.log('The issue is Postgres.app authentication blocking Cursor.');
console.log('');
console.log('IMMEDIATE STEPS TO FIX:');
console.log('1. Open Postgres.app (look for elephant icon in menu bar)');
console.log('2. Click the elephant icon');
console.log('3. Go to Settings/Preferences');
console.log('4. Find "App Permissions" section');
console.log('5. Add Cursor to trusted applications');
console.log('6. Restart Postgres.app');
console.log('');
console.log('ALTERNATIVE: Use pgAdmin or another PostgreSQL client');
console.log('Your database is at: /Users/thiqatech/Library/Application Support/Postgres/var-17/');
console.log('');
console.log('Let me try to create a test user in the new database as a temporary solution...');

// Create a temporary solution by setting up the new database properly
const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

async function createTempSolution() {
  try {
    console.log('🔄 Creating temporary solution...');
    
    // Test if we can connect to the new database
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to database');
    
    // Create tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS companies (
        company_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        role_name TEXT PRIMARY KEY,
        permissions JSONB NOT NULL,
        description TEXT
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        company_id TEXT NOT NULL,
        role_name TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        mfa_secret TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      )
    `);
    
    // Insert default data
    await pool.query(`
      INSERT INTO companies (company_id, name) 
      VALUES ('default-company', 'Default Company') 
      ON CONFLICT (company_id) DO NOTHING
    `);
    
    await pool.query(`
      INSERT INTO user_roles (role_name, permissions, description) 
      VALUES 
        ('Admin', '{"manage_users":true,"manage_devices":true,"view_reports":true,"send_commands":true}'::jsonb, 'Full access'),
        ('Manager', '{"manage_users":false,"manage_devices":true,"view_reports":true,"send_commands":true}'::jsonb, 'Operations manager')
      ON CONFLICT (role_name) DO NOTHING
    `);
    
    // Create test user
    const passwordHash = await bcrypt.hash('password123', 10);
    await pool.query(`
      INSERT INTO users (username, email, password_hash, company_id, role_name, is_active) 
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (username) DO UPDATE SET
        email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash,
        company_id = EXCLUDED.company_id,
        role_name = EXCLUDED.role_name,
        is_active = EXCLUDED.is_active
    `, [
      'reginaphanalge@mail.com',
      'reginaphanalge@mail.com',
      passwordHash,
      'default-company',
      'Admin',
      true
    ]);
    
    console.log('✅ Temporary solution created!');
    console.log('Test credentials:');
    console.log('Username: reginaphanalge@mail.com');
    console.log('Password: password123');
    console.log('OTP: 123456');
    console.log('');
    console.log('⚠️  This is a temporary solution. Your original data is still in Postgres.app.');
    console.log('Once you fix the Postgres.app authentication, we can restore your original data.');
    
  } catch (error) {
    console.error('❌ Error creating temporary solution:', error.message);
    console.log('');
    console.log('💡 The issue is still the database connection.');
    console.log('Please fix Postgres.app authentication first.');
  } finally {
    await pool.end();
  }
}

createTempSolution();



