-- Seed default roles with simple permission sets
INSERT INTO user_roles(role_name, permissions, description) VALUES
('Admin',        '{"manage_users":true,"manage_devices":true,"view_reports":true,"send_commands":true}'::jsonb, 'Full access'),
('Manager',      '{"manage_users":false,"manage_devices":true,"view_reports":true,"send_commands":true}'::jsonb, 'Operations manager'),
('Admin Tech',   '{"manage_users":false,"manage_devices":true,"view_reports":true,"send_commands":true}'::jsonb, 'Admin technician'),
('Tech',         '{"manage_users":false,"manage_devices":true,"view_reports":false,"send_commands":false}'::jsonb, 'Technician')
ON CONFLICT (role_name) DO NOTHING;
