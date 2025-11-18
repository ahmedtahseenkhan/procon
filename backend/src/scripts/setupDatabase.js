const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database...');
    
    // Test connection first
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');
    
    // Create database if it doesn't exist (this might fail if database already exists, which is fine)
    try {
      await pool.query('CREATE DATABASE procon_gaming');
      console.log('✅ Database created');
    } catch (err) {
      if (err.code === '42P04') {
        console.log('ℹ️  Database already exists');
      } else {
        throw err;
      }
    }
    
    // Create tables from schema
    console.log('📋 Creating tables...');
    
    // Companies table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS companies (
        company_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // User roles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        role_name TEXT PRIMARY KEY,
        permissions JSONB NOT NULL,
        description TEXT
      )
    `);
    
    // Users table
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
        last_login TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(company_id),
        FOREIGN KEY (role_name) REFERENCES user_roles(role_name)
      )
    `);
    
    console.log('✅ Tables created successfully');
    
    // Insert default data
    console.log('🌱 Seeding default data...');
    
    // Insert default company
    await pool.query(`
      INSERT INTO companies (company_id, name) 
      VALUES ('default-company', 'Default Company') 
      ON CONFLICT (company_id) DO NOTHING
    `);
    
    // Insert default roles
    await pool.query(`
      INSERT INTO user_roles (role_name, permissions, description) 
      VALUES 
        ('Admin', '{"manage_users":true,"manage_devices":true,"view_reports":true,"send_commands":true}'::jsonb, 'Full access'),
        ('Manager', '{"manage_users":false,"manage_devices":true,"view_reports":true,"send_commands":true}'::jsonb, 'Operations manager'),
        ('Admin Tech', '{"manage_users":false,"manage_devices":true,"view_reports":true,"send_commands":true}'::jsonb, 'Admin technician'),
        ('Tech', '{"manage_users":false,"manage_devices":true,"view_reports":false,"send_commands":false}'::jsonb, 'Technician')
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
    
    console.log('✅ Test user created:');
    console.log('   Username: reginaphanalge@mail.com');
    console.log('   Password: password123');
    console.log('   OTP: 123456');
    
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Make sure Postgres.app is running');
    console.log('2. Check Postgres.app permissions in Settings');
    console.log('3. Try restarting Postgres.app');
    console.log('4. Create a .env file with DATABASE_URL');
  } finally {
    await pool.end();
  }
}

setupDatabase();
