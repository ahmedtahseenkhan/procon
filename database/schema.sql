-- Companies table
CREATE TABLE company (
    company_id TEXT PRIMARY KEY,
    name TEXT
);

-- Devices table  
CREATE TABLE devices (
    device_id text PRIMARY KEY,
    company_id TEXT NOT NULL,
    account_id TEXT NOT NULL,
    FOREIGN KEY (company_id) REFERENCES company(company_id)
);

-- User authentication table
CREATE TABLE login (
    username TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    company_id TEXT NOT NULL,
    role_name TEXT NOT NULL,
    FOREIGN KEY (company_id) REFERENCES company(company_id)
);

-- Gaming events storage
CREATE TABLE gaming_event (
    packet_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    account_id TEXT,
    start_date DATE,
    end_date DATE,
    raw_payload JSONB
);

-- Device information storage
CREATE TABLE device_packets (
    packet_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    account_id TEXT,
    row_limit INTEGER,
    device_data JSONB
);
