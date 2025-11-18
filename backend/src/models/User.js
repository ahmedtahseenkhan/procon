const { pool } = require('../config/db');
async function findByUsername(username) {
  const { rows } = await pool.query('SELECT username, password_hash, company_id, role_name FROM login WHERE username=$1', [username]);
  return rows[0] || null;
}
module.exports = { findByUsername };
