const { pool } = require('../config/db');
async function latestPacketByAccount(accountId) {
  const { rows } = await pool.query('SELECT device_data FROM device_packets WHERE account_id::text = $1 ORDER BY fetched_at DESC LIMIT 1', [String(accountId)]);
  return rows[0]?.device_data || [];
}
module.exports = { latestPacketByAccount };
