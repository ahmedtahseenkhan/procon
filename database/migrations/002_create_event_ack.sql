-- Event acknowledgment table
CREATE TABLE IF NOT EXISTS event_ack (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    packet_id UUID NOT NULL REFERENCES gaming_event(packet_id) ON DELETE CASCADE,
    username TEXT NOT NULL REFERENCES login(username),
    acked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_ack_packet ON event_ack(packet_id);
