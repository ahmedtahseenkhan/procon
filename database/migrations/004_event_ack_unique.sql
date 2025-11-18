-- Prevent duplicate acknowledgments per user per event
CREATE UNIQUE INDEX IF NOT EXISTS ux_event_ack_packet_user ON event_ack(packet_id, username);
