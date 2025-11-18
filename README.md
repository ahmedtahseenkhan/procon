# Procon Gaming Management Portal

A full‑stack portal for Procon gaming device management: authentication with MFA, real‑time alerts, map visualization, financial reports, and device control.

## Tech Stack
- Frontend: React + TypeScript (Vite)
- Backend: Node.js + Express
- Database: PostgreSQL
- Map: Google Maps JavaScript API
- Auth: JWT + TOTP (OTP)

## Project Structure
```
procon-gaming-portal/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── services/
│   │   └── scripts/migrate.js
├── frontend/
│   └── src/
└── database/
    ├── schema.sql
    └── migrations/
```

## Quick Start

### 1) Database
- Ensure PostgreSQL is running and you have a database, e.g. `procon`.
- Configure connection string in `backend/.env`.

Optional pre-steps (if needed for permissions):
```
psql -d procon -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
```

### 2) Backend
```
# install deps
cd backend
npm install

# env
cp .env.example .env
# edit .env and set: DATABASE_URL, JWT_SECRET, OTP_SHARED_SECRET, PROCON_API_*.

# run migrations (applies database/schema.sql + migrations/*)
npm run migrate

# start dev
npm run dev
```

Create initial admin user (example):
```
# generate bcrypt hash (replace password as desired)
node -e "require('bcrypt').hash('admin123', 10).then(h=>console.log(h))"

# in psql, insert company and user (adjust values)
INSERT INTO company (company_id, name) VALUES ('acme', 'Acme Corp') ON CONFLICT DO NOTHING;
INSERT INTO login (username, password_hash, company_id, role_name)
VALUES ('admin', '<PASTE_HASH_HERE>', 'acme', 'Admin');
```

TOTP: The backend uses a shared secret from `OTP_SHARED_SECRET` (issuer `OTP_ISSUER=Procon`). Use any TOTP app with that secret to produce 6‑digit codes.

### 3) Frontend
```
cd ../frontend
npm install
cp .env.example .env
# set VITE_API_BASE_URL (default http://localhost:4000) and VITE_GOOGLE_MAPS_API_KEY
npm run dev
```

## Features (MVP)
- Auth: JWT login with username/password + TOTP OTP.
- RBAC: Route protection via `role_name`. Example restricted: device command endpoint.
- Dashboard/Map: Google Maps cluster of devices (from `device_packets.device_data`).
- Alerts: Recent events (from `gaming_event.raw_payload`) with per‑user acknowledgment.
- Reports: CoinIn/CoinOut aggregation (cents to dollars).
- Background sync: Plumbed (`services/backgroundSync.js`) with API service stubs.

## API (selected)
- POST `/api/auth/login` { username, password, otp } -> { token }
- GET `/api/auth/me` -> user info
- GET `/api/devices`
- POST `/api/devices/:deviceId/command` { action }
- GET `/api/events` [device_id]
- POST `/api/events/:packetId/ack`
- GET `/api/events/stream` (SSE)

## Notes
- Company isolation: queries filter by `account_id` matching the authenticated user’s `company_id` (both TEXT).
- Migrations: `001_enable_pgcrypto.sql` runs before schema; if extension creation needs superuser, run it manually.
- Map data shape: expects each device to include `lat` and `lon` in `device_packets.device_data`.

## Next Steps
- Implement real Procon API polling in `proconApiService.js`.
- Add user management CRUD (Admin) and password reset flow.
- Add exports (PDF/Excel) and richer charts.
- Harden security (per‑user TOTP secrets, refresh tokens, rate limits per route).
