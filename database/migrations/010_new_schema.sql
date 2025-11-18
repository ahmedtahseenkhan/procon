-- New normalized schema

-- COMPANIES
CREATE TABLE IF NOT EXISTS companies (
    company_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DEVICES
CREATE TABLE IF NOT EXISTS devices (
    device_id TEXT PRIMARY KEY,
    imei TEXT UNIQUE NOT NULL,
    serial_number TEXT NOT NULL,
    company_id TEXT NOT NULL,
    account_id TEXT NOT NULL,
    nickname TEXT,
    status TEXT DEFAULT 'active',
    last_known_lat DECIMAL(10, 8),
    last_known_lng DECIMAL(10, 8),
    last_event_time TIMESTAMP,
    is_online BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(company_id)
);
CREATE INDEX IF NOT EXISTS idx_devices_company ON devices(company_id);
CREATE INDEX IF NOT EXISTS idx_devices_account ON devices(account_id);
CREATE INDEX IF NOT EXISTS idx_devices_imei ON devices(imei);

-- EVENT TYPES
CREATE TABLE IF NOT EXISTS event_types (
    event_type TEXT NOT NULL,
    event_id TEXT NOT NULL,
    severity TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    PRIMARY KEY (event_type, event_id)
);

-- Seed known event types
INSERT INTO event_types (event_type, event_id, severity, category, description) VALUES
('MachineLogEvent', 'Money Added', 'normal', 'financial', 'Money added to machine')
ON CONFLICT DO NOTHING;
INSERT INTO event_types (event_type, event_id, severity, category, description) VALUES
('MachineLogEvent', 'Current Status Update', 'critical', 'security', 'Machine status change')
ON CONFLICT DO NOTHING;
INSERT INTO event_types (event_type, event_id, severity, category, description) VALUES
('MachineLogEvent', 'Main Door Open', 'critical', 'security', 'Main door access')
ON CONFLICT DO NOTHING;
INSERT INTO event_types (event_type, event_id, severity, category, description) VALUES
('MachineLogEvent', 'Upper Door Open', 'critical', 'security', 'Upper door access')
ON CONFLICT DO NOTHING;
INSERT INTO event_types (event_type, event_id, severity, category, description) VALUES
('MachineLogEvent', 'Belly Door Open', 'critical', 'security', 'Belly door access')
ON CONFLICT DO NOTHING;
INSERT INTO event_types (event_type, event_id, severity, category, description) VALUES
('MachineLogEvent', 'Cash Door Open', 'critical', 'security', 'Cash door access')
ON CONFLICT DO NOTHING;
INSERT INTO event_types (event_type, event_id, severity, category, description) VALUES
('MachineLogEvent', 'Cash Box Removed', 'critical', 'security', 'Cash box removed')
ON CONFLICT DO NOTHING;
INSERT INTO event_types (event_type, event_id, severity, category, description) VALUES
('MachineLogEvent', 'Voucher Over Threshold', 'warning', 'financial', 'Large voucher payout')
ON CONFLICT DO NOTHING;
INSERT INTO event_types (event_type, event_id, severity, category, description) VALUES
('MachineLogEvent', 'Vibration/Tamper Alert', 'critical', 'security', 'Unauthorized movement')
ON CONFLICT DO NOTHING;
INSERT INTO event_types (event_type, event_id, severity, category, description) VALUES
('MachineLogEvent', 'Power Disconnect', 'warning', 'operational', 'Power lost')
ON CONFLICT DO NOTHING;

-- USERS & ROLES
CREATE TABLE IF NOT EXISTS user_roles (
    role_name TEXT PRIMARY KEY,
    permissions JSONB NOT NULL,
    description TEXT
);
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
);

-- DEVICE EVENTS
CREATE TABLE IF NOT EXISTS device_events (
    event_uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    row_id BIGINT NOT NULL UNIQUE,
    device_id TEXT NOT NULL,
    imei TEXT NOT NULL,
    serial_number TEXT NOT NULL,
    company_id TEXT NOT NULL,
    account_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_id TEXT NOT NULL,
    event_entry TEXT,
    parsed_amount DECIMAL(15, 2),
    parsed_status TEXT,
    is_door_event BOOLEAN DEFAULT false,
    is_financial_event BOOLEAN DEFAULT false,
    is_cash_box_event BOOLEAN DEFAULT false,
    event_timestamp TIMESTAMP NOT NULL,
    report_timestamp TIMESTAMP NOT NULL,
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    severity TEXT NOT NULL,
    is_acknowledged BOOLEAN DEFAULT false,
    acknowledged_by UUID,
    acknowledged_at TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(device_id),
    FOREIGN KEY (company_id) REFERENCES companies(company_id),
    FOREIGN KEY (event_type, event_id) REFERENCES event_types(event_type, event_id)
);

-- ACTIVE ALERTS
CREATE TABLE IF NOT EXISTS active_alerts (
    alert_uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_uuid UUID NOT NULL UNIQUE,
    device_id TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    assigned_to UUID,
    notes TEXT,
    auto_resolve_at TIMESTAMP,
    FOREIGN KEY (event_uuid) REFERENCES device_events(event_uuid),
    FOREIGN KEY (device_id) REFERENCES devices(device_id)
);

-- FINANCIAL SUMMARY
CREATE TABLE IF NOT EXISTS financial_summary (
    summary_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id TEXT NOT NULL,
    company_id TEXT NOT NULL,
    summary_date DATE NOT NULL,
    total_cash_in DECIMAL(15, 2) DEFAULT 0,
    total_cash_out DECIMAL(15, 2) DEFAULT 0,
    transaction_count INTEGER DEFAULT 0,
    last_transaction_time TIMESTAMP,
    UNIQUE(device_id, summary_date),
    FOREIGN KEY (device_id) REFERENCES devices(device_id),
    FOREIGN KEY (company_id) REFERENCES companies(company_id)
);

-- API SYNC LOGS
CREATE TABLE IF NOT EXISTS api_sync_logs (
    sync_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_type TEXT NOT NULL,
    account_id TEXT,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    last_row_id BIGINT,
    rows_fetched INTEGER DEFAULT 0,
    sync_duration INTERVAL,
    status TEXT DEFAULT 'success',
    error_message TEXT,
    sync_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_device_events_device_timestamp ON device_events(device_id, event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_device_events_severity ON device_events(severity, event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_device_events_financial ON device_events(is_financial_event, event_timestamp);
CREATE INDEX IF NOT EXISTS idx_device_events_row_id ON device_events(row_id);
CREATE INDEX IF NOT EXISTS idx_active_alerts_device ON active_alerts(device_id, resolved_at);
