const { pool } = require('../config/db');
const proconApi = require('./proconApiService');
const processor = require('./eventProcessor');
let timer = null;

async function upsertEventType(client, parsed) {
  const eventType = parsed.event_type;
  const eventId = parsed.event_id;
  if (!eventType || !eventId) return;
  const category = parsed.is_financial_event
    ? 'financial'
    : (parsed.is_door_event || parsed.is_cash_box_event) ? 'security' : 'misc';
  const defaultSeverity = (parsed.is_door_event || parsed.is_cash_box_event) ? 'critical' : 'info';
  await client.query(
    `INSERT INTO event_types(event_type, event_id, category, severity)
     VALUES($1, $2, $3, $4)
     ON CONFLICT (event_type, event_id) DO NOTHING`,
    [eventType, eventId, category, defaultSeverity]
  );
}

async function upsertDevice(client, parsed, companyId, accountId) {
  await client.query(
    `INSERT INTO devices(device_id, imei, serial_number, company_id, account_id, last_event_time, updated_at)
     VALUES($1, $2, $3, $4, $5, $6, now())
     ON CONFLICT (device_id)
     DO UPDATE SET imei = EXCLUDED.imei,
                   serial_number = EXCLUDED.serial_number,
                   company_id = EXCLUDED.company_id,
                   account_id = EXCLUDED.account_id,
                   last_event_time = GREATEST(devices.last_event_time, EXCLUDED.last_event_time),
                   updated_at = now()`,
    [parsed.device_id, parsed.imei, parsed.serial_number, companyId, accountId, parsed.event_timestamp]
  );
}

async function upsertDeviceFromApi(client, d) {
  const deviceId = d.serial;
  if (!deviceId) return;
  const imei = d.imei || null;
  const companyId = d.accountid || null;
  const accountId = d.accountid || null;
  const nickname = d.nickname || null;
  const lat = d.eventlat != null && d.eventlat !== '' ? Number(d.eventlat) : null;
  const lng = d.eventlng != null && d.eventlng !== '' ? Number(d.eventlng) : null;
  const lastGpsTime = d.lastgpseventtimestamp ? new Date((String(d.lastgpseventtimestamp)).replace(' ', 'T') + 'Z') : null;
  const vehicleStock = d.vehiclestock || null;
  const eventSatellites = d.eventsatellites != null && d.eventsatellites !== '' ? parseFloat(d.eventsatellites) : null;
  const eventRssi = d.eventrssi != null && d.eventrssi !== '' ? parseInt(d.eventrssi, 10) : null;
  const eventVoltage = d.eventvoltage != null && d.eventvoltage !== '' ? parseFloat(d.eventvoltage) : null;
  const activationDate = d.activationdate || null;
  const deliveryDate = d.deliverydate || null;
  const groupName = d.groupname || null;
  const fullAddress = d.fulladdress || null;
  const country = d.country || null;
  const admin1 = d.admin1 || null;
  const admin2 = d.admin2 || null;
  const admin3 = d.admin3 || null;
  const city = d.city || null;
  const route = d.route || null;
  const streetNumber = d.number || null;
  const postalCode = d.postalcode || null;
  await client.query(
    `INSERT INTO devices(device_id, imei, serial_number, company_id, account_id, nickname, last_known_lat, last_known_lng, last_event_time, vehicle_stock, event_satellites, event_rssi, event_voltage, activation_date, delivery_date, group_name, full_address, country, admin1, admin2, admin3, city, route, street_number, postal_code, updated_at)
     VALUES($1,$2,$1,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24, now())
     ON CONFLICT (device_id)
     DO UPDATE SET imei = COALESCE(EXCLUDED.imei, devices.imei),
                   serial_number = devices.serial_number,
                   company_id = COALESCE(EXCLUDED.company_id, devices.company_id),
                   account_id = COALESCE(EXCLUDED.account_id, devices.account_id),
                   nickname = COALESCE(EXCLUDED.nickname, devices.nickname),
                   last_known_lat = COALESCE(EXCLUDED.last_known_lat, devices.last_known_lat),
                   last_known_lng = COALESCE(EXCLUDED.last_known_lng, devices.last_known_lng),
                   last_event_time = GREATEST(COALESCE(devices.last_event_time, to_timestamp(0)), COALESCE(EXCLUDED.last_event_time, to_timestamp(0))),
                   vehicle_stock = COALESCE(EXCLUDED.vehicle_stock, devices.vehicle_stock),
                   event_satellites = COALESCE(EXCLUDED.event_satellites, devices.event_satellites),
                   event_rssi = COALESCE(EXCLUDED.event_rssi, devices.event_rssi),
                   event_voltage = COALESCE(EXCLUDED.event_voltage, devices.event_voltage),
                   activation_date = COALESCE(EXCLUDED.activation_date, devices.activation_date),
                   delivery_date = COALESCE(EXCLUDED.delivery_date, devices.delivery_date),
                   group_name = COALESCE(EXCLUDED.group_name, devices.group_name),
                   full_address = COALESCE(EXCLUDED.full_address, devices.full_address),
                   country = COALESCE(EXCLUDED.country, devices.country),
                   admin1 = COALESCE(EXCLUDED.admin1, devices.admin1),
                   admin2 = COALESCE(EXCLUDED.admin2, devices.admin2),
                   admin3 = COALESCE(EXCLUDED.admin3, devices.admin3),
                   city = COALESCE(EXCLUDED.city, devices.city),
                   route = COALESCE(EXCLUDED.route, devices.route),
                   street_number = COALESCE(EXCLUDED.street_number, devices.street_number),
                   postal_code = COALESCE(EXCLUDED.postal_code, devices.postal_code),
                   updated_at = now()`,
    [deviceId, imei, companyId, accountId, nickname, lat, lng, lastGpsTime, vehicleStock, eventSatellites, eventRssi, eventVoltage, activationDate, deliveryDate, groupName, fullAddress, country, admin1, admin2, admin3, city, route, streetNumber, postalCode]
  );
}

async function insertEvent(client, parsed, companyId, accountId) {
  const { rows } = await client.query(
    `INSERT INTO device_events(
        row_id, device_id, imei, serial_number, company_id, account_id,
        event_type, event_id, event_entry, parsed_amount, parsed_status,
        is_door_event, is_financial_event, is_cash_box_event,
        event_timestamp, report_timestamp, severity
     ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
     ON CONFLICT (row_id) DO NOTHING
     RETURNING event_uuid`,
    [
      parsed.row_id,
      parsed.device_id,
      parsed.imei,
      parsed.serial_number,
      companyId,
      accountId,
      parsed.event_type,
      parsed.event_id,
      parsed.event_entry,
      parsed.parsed_amount,
      parsed.parsed_status,
      parsed.is_door_event,
      parsed.is_financial_event,
      parsed.is_cash_box_event,
      parsed.event_timestamp,
      parsed.report_timestamp,
      parsed.severity,
    ]
  );
  return rows[0]?.event_uuid || null;
}

async function upsertFinancialSummary(client, parsed, companyId) {
  if (!parsed.is_financial_event || !parsed.parsed_amount) return;
  const summaryDate = new Date(parsed.event_timestamp);
  const yyyyMmDd = summaryDate.toISOString().slice(0, 10);
  await client.query(
    `INSERT INTO financial_summary (device_id, company_id, summary_date, total_cash_in, transaction_count, last_transaction_time)
     VALUES($1,$2,$3,$4,1,$5)
     ON CONFLICT (device_id, summary_date)
     DO UPDATE SET total_cash_in = financial_summary.total_cash_in + EXCLUDED.total_cash_in,
                   transaction_count = financial_summary.transaction_count + 1,
                   last_transaction_time = GREATEST(financial_summary.last_transaction_time, EXCLUDED.last_transaction_time)`,
    [parsed.device_id, companyId, yyyyMmDd, parsed.parsed_amount, parsed.event_timestamp]
  );
}

async function manageActiveAlerts(client, eventUuid, parsed) {
  if (!eventUuid) return;
  if (parsed.severity === 'critical' && (parsed.is_door_event || parsed.is_cash_box_event)) {
    await client.query(
      `INSERT INTO active_alerts(event_uuid, device_id, alert_type, severity)
       VALUES($1, $2, $3, $4)
       ON CONFLICT (event_uuid) DO NOTHING`,
      [eventUuid, parsed.device_id, parsed.event_id || parsed.parsed_status || 'alert', parsed.severity]
    );
  }
}

async function syncOnce() {
  const accountId = process.env.PROCON_ACCOUNT_ID;
  // Basic approach: last 24h window. In production, store last_row_id/time in api_sync_logs and use it.
  const raw = await proconApi.pollEvents({ accountId });
  const deviceList = await proconApi.pollDevices({ accountId, rowLimit: 1000 });
  const client = await pool.connect();
  const startTime = Date.now();
  let rowsFetched = 0;
  try {
    await client.query('BEGIN');
    // upsert devices from devices API first
    for (const d of deviceList) {
      // ensure company exists
      if (d.accountid) {
        await client.query(
          `INSERT INTO companies(company_id, name) VALUES($1, $2)
           ON CONFLICT (company_id) DO NOTHING`,
          [d.accountid, d.accountname || d.accountid]
        );
      }
      await upsertDeviceFromApi(client, d);
    }
    for (const r of raw) {
      rowsFetched++;
      const parsed = processor.processEvent(r);
      const companyId = r.accountid || accountId || 'unknown';
      // ensure company exists
      await client.query(
        `INSERT INTO companies(company_id, name) VALUES($1, $2)
         ON CONFLICT (company_id) DO NOTHING`,
        [companyId, companyId]
      );
      await upsertEventType(client, parsed);
      await upsertDevice(client, parsed, companyId, r.accountid || null);
      const eventUuid = await insertEvent(client, parsed, companyId, r.accountid || null);
      await upsertFinancialSummary(client, parsed, companyId);
      await manageActiveAlerts(client, eventUuid, parsed);
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    await client.query(
      `INSERT INTO api_sync_logs(sync_type, account_id, rows_fetched, status, error_message, sync_duration)
       VALUES($1,$2,$3,$4,$5, make_interval(secs => $6))`,
      ['events', accountId, rowsFetched, 'failed', e.message || 'error', Math.round((Date.now() - startTime)/1000)]
    );
    throw e;
  } finally {
    client.release();
  }
  await pool.query(
    `INSERT INTO api_sync_logs(sync_type, account_id, rows_fetched, status, sync_duration)
     VALUES($1,$2,$3,$4, make_interval(secs => $5))`,
    ['events', accountId, rowsFetched, 'success', Math.round((Date.now() - startTime)/1000)]
  );
}

// Backfill a specific date range and ingest into normalized tables
async function syncWindow({ accountId, startDate, endDate, rowLimitDevices = 1000 }) {
  const acc = accountId || process.env.PROCON_ACCOUNT_ID;
  const raw = await proconApi.pollEvents({ accountId: acc, startDate, endDate });
  const deviceList = await proconApi.pollDevices({ accountId: acc, rowLimit: rowLimitDevices });
  const client = await pool.connect();
  const startTime = Date.now();
  let rowsFetched = 0;
  try {
    await client.query('BEGIN');
    for (const d of deviceList) {
      if (d.accountid) {
        await client.query(
          `INSERT INTO companies(company_id, name) VALUES($1, $2)
           ON CONFLICT (company_id) DO NOTHING`,
          [d.accountid, d.accountname || d.accountid]
        );
      }
      await upsertDeviceFromApi(client, d);
    }
    for (const r of raw) {
      rowsFetched++;
      const parsed = processor.processEvent(r);
      const companyId = r.accountid || acc || 'unknown';
      await client.query(
        `INSERT INTO companies(company_id, name) VALUES($1, $2)
         ON CONFLICT (company_id) DO NOTHING`,
        [companyId, companyId]
      );
      await upsertEventType(client, parsed);
      await upsertDevice(client, parsed, companyId, r.accountid || null);
      const eventUuid = await insertEvent(client, parsed, companyId, r.accountid || null);
      await upsertFinancialSummary(client, parsed, companyId);
      await manageActiveAlerts(client, eventUuid, parsed);
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    await client.query(
      `INSERT INTO api_sync_logs(sync_type, account_id, rows_fetched, status, error_message, sync_duration)
       VALUES($1,$2,$3,$4,$5, make_interval(secs => $6))`,
      ['events_window', acc, rowsFetched, 'failed', e.message || 'error', Math.round((Date.now() - startTime)/1000)]
    );
    throw e;
  } finally {
    client.release();
  }
  await pool.query(
    `INSERT INTO api_sync_logs(sync_type, account_id, rows_fetched, status, sync_duration)
     VALUES($1,$2,$3,$4, make_interval(secs => $5))`,
    ['events_window', acc, rowsFetched, 'success', Math.round((Date.now() - startTime)/1000)]
  );
}

function start() {
  if (timer) return;
  timer = setInterval(syncOnce, 15 * 60 * 1000);
}

module.exports = { start, syncOnce, syncWindow };
