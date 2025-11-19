const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

async function listUsers(req, res) {
  try {
    const companyId = req.user.company_id;
    const { rows } = await pool.query(
      `SELECT user_id, username, email, role_name, is_active, created_at, last_login
       FROM users 
       WHERE company_id = $1 
       ORDER BY created_at DESC`,
      [companyId]
    );
    res.json({ users: rows });
  } catch (e) {
    console.error('Error fetching users:', e);
    res.status(500).json({ error: 'server_error' });
  }
}

async function createUser(req, res) {
  const { username, email, password, role_name, company_id } = req.body;
  
  if (!username || !email || !password || !role_name) {
    return res.status(400).json({ error: 'missing_required_fields' });
  }

  try {
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT user_id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'user_already_exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    const { rows } = await pool.query(
      `INSERT INTO users (username, email, password_hash, role_name, company_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING user_id, username, email, role_name, is_active, created_at`,
      [username, email, passwordHash, role_name, company_id || req.user.company_id]
    );
    
    res.status(201).json({ user: rows[0] });
  } catch (e) {
    console.error('Error creating user:', e);
    res.status(500).json({ error: 'server_error' });
  }
}

async function updateUser(req, res) {
  const { userId } = req.params;
  const { username, email, password, role_name, is_active } = req.body;
  
  try {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (username) {
      updates.push(`username = $${paramCount++}`);
      values.push(username);
    }
    
    if (email) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }
    
    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      updates.push(`password_hash = $${paramCount++}`);
      values.push(passwordHash);
    }
    
    if (role_name) {
      updates.push(`role_name = $${paramCount++}`);
      values.push(role_name);
    }
    
    if (typeof is_active === 'boolean') {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'no_updates_provided' });
    }

    values.push(userId);
    values.push(req.user.company_id);

    const { rows } = await pool.query(
      `UPDATE users 
       SET ${updates.join(', ')}
       WHERE user_id = $${paramCount} AND company_id = $${paramCount + 1}
       RETURNING user_id, username, email, role_name, is_active, created_at, last_login`,
      values
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'user_not_found' });
    }

    res.json({ user: rows[0] });
  } catch (e) {
    console.error('Error updating user:', e);
    res.status(500).json({ error: 'server_error' });
  }
}

async function deleteUser(req, res) {
  const { userId } = req.params;
  
  try {
    const { rows } = await pool.query(
      `DELETE FROM users 
       WHERE user_id = $1 AND company_id = $2
       RETURNING user_id, username`,
      [userId, req.user.company_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'user_not_found' });
    }

    res.json({ message: 'User deleted successfully', user: rows[0] });
  } catch (e) {
    console.error('Error deleting user:', e);
    res.status(500).json({ error: 'server_error' });
  }
}

async function getUserById(req, res) {
  const { userId } = req.params;
  
  try {
    const { rows } = await pool.query(
      `SELECT user_id, username, email, role_name, is_active, created_at, last_login
       FROM users 
       WHERE user_id = $1 AND company_id = $2`,
      [userId, req.user.company_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'user_not_found' });
    }

    res.json({ user: rows[0] });
  } catch (e) {
    console.error('Error fetching user:', e);
    res.status(500).json({ error: 'server_error' });
  }
}

module.exports = {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserById
};
