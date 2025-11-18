const { pool } = require('../config/db');
const proconApi = require('../services/proconApiService');
async function listDevices(req, res) {
  try {
    const companyId = req.user.company_id;
    const { rows } = await pool.query(
      `SELECT device_id, imei, serial_number, nickname, status, last_known_lat, last_known_lng, last_event_time, is_online, group_name, full_address
       FROM devices WHERE company_id = $1 ORDER BY updated_at DESC LIMIT 1000`,
      [String(companyId)]
    );
    const devices = rows.map((r) => ({
      device_id: r.device_id,
      imei: r.imei,
      serial_number: r.serial_number,
      nickname: r.nickname,
      status: r.status,
      // Ensure lat/lon are numbers for the map filter
      lat:
        r.last_known_lat !== null && r.last_known_lat !== undefined
          ? Number(r.last_known_lat)
          : null,
      lon:
        r.last_known_lng !== null && r.last_known_lng !== undefined
          ? Number(r.last_known_lng)
          : null,
      last_event_time: r.last_event_time,
      is_online: r.is_online,
      group_name: r.group_name,
      full_address: r.full_address,
    }));
    res.json({ devices });
  } catch (e) {
    res.status(500).json({ error: 'server_error' });
  }
}
async function deviceCommand(req, res) {
  const { deviceId } = req.params;
  const { action } = req.body || {};
  if (!action) return res.status(400).json({ error: 'missing_action' });
  try {
    const result = await proconApi.sendDeviceCommand(deviceId, action);
    await pool.query(
      'INSERT INTO device_command_log(device_id, action, username, status, response) VALUES($1, $2, $3, $4, $5)',
      [deviceId, action, req.user.username, 'sent', result]
    );
    res.json({ status: 'sent', result });
  } catch (e) {
    try {
      await pool.query(
        'INSERT INTO device_command_log(device_id, action, username, status, response) VALUES($1, $2, $3, $4, $5)',
        [req.params.deviceId, action, req.user.username, 'error', { message: e?.message || 'error' }]
      );
    } catch {}
    res.status(500).json({ error: 'server_error' });
  }
}
module.exports = { listDevices, deviceCommand };
