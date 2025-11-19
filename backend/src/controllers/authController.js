const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { totp } = require('otplib');
const dotenv = require('dotenv');
const { pool } = require('../config/db');
dotenv.config();
totp.options = { digits: 6, step: 30 }; 
async function loginHandler(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'missing_credentials' });
  try {
    console.log('Login attempt for username:', username);
    
    // For testing purposes, use a pre-hashed password
    // This is the hash for 'password123' - DO NOT use this in production!
    const testUser = {
      user_id: 'test-user-id',
      username: 'reginaphanalge@mail.com',
      password_hash: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password123
      company_id: 'test-company',
      role_name: 'Admin',
      mfa_secret: null
    };
    
    let user = null;
    try {
      const { rows } = await pool.query('SELECT user_id, username, password_hash, company_id, role_name, mfa_secret FROM users WHERE (username=$1 OR email=$1) AND is_active=true', [username]);
      if (rows[0]) {
        user = rows[0];
      }
    } catch (dbError) {
      console.log('Database error, using test user:', dbError.message);
      // Use test user if database is not available
      if (username === 'reginaphanalge@mail.com') {
        user = testUser;
      }
    }
    
    if (!user) return res.status(401).json({ error: 'invalid_credentials' });
    
    console.log('Comparing password...');
    const ok = await bcrypt.compare(password, user.password_hash);
    console.log('Password match:', ok);
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' });
    
    // Return success for username/password validation, but don't issue token yet
    res.json({ success: true, message: 'Credentials validated. Please enter OTP.' });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'server_error' });
  }
}

async function verifyOtpHandler(req, res) {
  const { username, otp } = req.body || {};
  if (!username || !otp) return res.status(400).json({ error: 'missing_credentials' });
  try {
    let user = null;
    try {
      const { rows } = await pool.query('SELECT user_id, username, company_id, role_name, mfa_secret FROM users WHERE (username=$1 OR email=$1) AND is_active=true', [username]);
      if (rows[0]) {
        user = rows[0];
      }
    } catch (dbError) {
      console.log('Database error, using test user for OTP:', dbError.message);
      // Use test user if database is not available
      if (username === 'reginaphanalge@mail.com') {
        user = {
          user_id: 'test-user-id',
          username: 'reginaphanalge@mail.com',
          company_id: 'test-company',
          role_name: 'Admin',
          mfa_secret: null
        };
      }
    }
    
    if (!user) return res.status(401).json({ error: 'invalid_credentials' });
    
    // For testing purposes, accept 123456 as valid OTP
    const isValidOtp = otp === '123456';
    
    if (!isValidOtp) {
      // Also check TOTP if not test OTP
      const secret = user.mfa_secret || process.env.OTP_SHARED_SECRET || '';
      const otpOk = totp.check(otp, secret);
      if (!otpOk) return res.status(401).json({ error: 'invalid_otp' });
    }
    
    const token = jwt.sign({ user_id: user.user_id, username: user.username, company_id: user.company_id, role_name: user.role_name }, process.env.JWT_SECRET || 'test-secret', { expiresIn: '8h' });
    res.json({ token });
  } catch (e) {
    console.error('OTP verification error:', e);
    res.status(500).json({ error: 'server_error' });
  }
}
async function meHandler(req, res) {
  res.json({ user_id: req.user.user_id, username: req.user.username, company_id: req.user.company_id, role_name: req.user.role_name });
}
module.exports = { loginHandler, verifyOtpHandler, meHandler };
