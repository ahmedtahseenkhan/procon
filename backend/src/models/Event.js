const { pool } = require('../config/db');
async function recentEventsByAccount(accountId, limit = 500) {
  const { rows } = await pool.query('SELECT raw_payload FROM gaming_event WHERE account_id::text = $1 ORDER BY fetched_at DESC LIMIT $2', [String(accountId), limit]);
  return rows.map(r => r.raw_payload);
}
module.exports = { recentEventsByAccount };
