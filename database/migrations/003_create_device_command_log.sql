-- Device command log
CREATE TABLE IF NOT EXISTS device_command_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    device_id TEXT NOT NULL,
    action TEXT NOT NULL,
    username TEXT NOT NULL REFERENCES login(username),
    status TEXT NOT NULL,
    response JSONB
);

CREATE INDEX IF NOT EXISTS idx_device_command_log_device ON device_command_log(device_id);
