const { pool } = require('../config/db');

async function listEvents(req, res) {
  const { device_id, limit } = req.query;
  try {
    const companyId = req.user.company_id;
    const lim = Math.min(parseInt(limit || '500', 10), 1000);
    const params = [String(companyId)];
    let sql = `
      SELECT de.event_uuid, de.device_id, de.imei, de.serial_number, de.event_type, de.event_id, de.event_entry,
             de.parsed_amount, de.parsed_status, de.is_door_event, de.is_financial_event, de.is_cash_box_event,
             de.event_timestamp, de.report_timestamp, de.severity, de.is_acknowledged, de.acknowledged_by, de.acknowledged_at,
             et.category
      FROM device_events de
      LEFT JOIN event_types et ON et.event_type = de.event_type AND et.event_id = de.event_id
      WHERE de.company_id = $1
      ORDER BY de.event_timestamp DESC
      LIMIT ${lim}`;
    if (device_id) {
      params.push(device_id);
      sql = `
        SELECT de.event_uuid, de.device_id, de.imei, de.serial_number, de.event_type, de.event_id, de.event_entry,
               de.parsed_amount, de.parsed_status, de.is_door_event, de.is_financial_event, de.is_cash_box_event,
               de.event_timestamp, de.report_timestamp, de.severity, de.is_acknowledged, de.acknowledged_by, de.acknowledged_at,
               et.category
        FROM device_events de
        LEFT JOIN event_types et ON et.event_type = de.event_type AND et.event_id = de.event_id
        WHERE de.company_id = $1 AND (de.device_id = $2 OR de.imei = $2 OR de.serial_number = $2)
        ORDER BY de.event_timestamp DESC
        LIMIT ${lim}`;
    }
    const { rows } = await pool.query(sql, params);
    res.json({ events: rows });
  } catch (e) {
    res.status(500).json({ error: 'server_error' });
  }
}

async function ackEvent(req, res) {
  const { eventUuid } = req.params;
  if (!eventUuid) return res.status(400).json({ error: 'missing_event_uuid' });
  try {
    await pool.query(
      `UPDATE device_events
       SET is_acknowledged = true, acknowledged_by = $2, acknowledged_at = now()
       WHERE event_uuid = $1 AND company_id = $3`,
      [eventUuid, req.user.user_id, req.user.company_id]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'server_error' });
  }
}

async function sseEvents(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  const tick = async () => {
    try {
      const { rows } = await pool.query(
        `SELECT de.event_uuid, de.device_id, de.imei, de.serial_number, de.event_type, de.event_id, de.event_entry,
                de.parsed_amount, de.parsed_status, de.is_door_event, de.is_financial_event, de.is_cash_box_event,
                de.event_timestamp, de.report_timestamp, de.severity, de.is_acknowledged, de.acknowledged_by, de.acknowledged_at,
                et.category
         FROM device_events de
         LEFT JOIN event_types et ON et.event_type = de.event_type AND et.event_id = de.event_id
         WHERE de.company_id = $1
         ORDER BY de.event_timestamp DESC
         LIMIT 20`,
        [String(req.user.company_id)]
      );
      res.write(`data: ${JSON.stringify({ events: rows })}\n\n`);
    } catch (e) {}
  };
  const timer = setInterval(tick, 5000);
  // send immediately
  tick();
  req.on('close', () => clearInterval(timer));
}

module.exports = { listEvents, ackEvent, sseEvents };
