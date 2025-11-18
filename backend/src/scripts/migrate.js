#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function run() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (filename TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Failed to ensure schema_migrations table:', e.message);
    process.exit(1);
  } finally {
    client.release();
  }

  async function hasMigration(filename) {
    const { rows } = await pool.query('SELECT 1 FROM schema_migrations WHERE filename=$1', [filename]);
    return !!rows[0];
  }
  async function applyMigration(filename, sql) {
    const c = await pool.connect();
    try {
      await c.query('BEGIN');
      await c.query(sql);
      await c.query('INSERT INTO schema_migrations(filename) VALUES($1)', [filename]);
      await c.query('COMMIT');
      console.log('Applied', filename);
    } catch (e) {
      await c.query('ROLLBACK');
      console.error('Error applying', filename, e.message);
      throw e;
    } finally {
      c.release();
    }
  }

  // Paths
  const root = path.join(__dirname, '../../../');
  const schemaPath = path.join(root, 'database/schema.sql');
  const migDir = path.join(root, 'database/migrations');

  // 1) Apply pgcrypto enablement first if present
  if (fs.existsSync(migDir)) {
    const pgcryptoFile = '001_enable_pgcrypto.sql';
    const pgcryptoPath = path.join(migDir, pgcryptoFile);
    if (fs.existsSync(pgcryptoPath)) {
      const fname = `migrations/${pgcryptoFile}`;
      if (!(await hasMigration(fname))) {
        const sql = fs.readFileSync(pgcryptoPath, 'utf8');
        await applyMigration(fname, sql);
      } else {
        console.log('Skip', fname);
      }
    }
  }

  // 2) Apply base schema (legacy) only if normalized schema is not present
  const hasNormalized = fs.existsSync(path.join(migDir, '010_new_schema.sql'));
  if (!hasNormalized && fs.existsSync(schemaPath)) {
    const already = await hasMigration('__schema.sql');
    if (!already) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await applyMigration('__schema.sql', schemaSql);
    } else {
      console.log('Schema already applied');
    }
  } else if (!hasNormalized) {
    console.warn('No database/schema.sql found');
  } else {
    console.log('Skipping legacy schema.sql; using normalized migrations.');
  }

  // 3) Apply remaining migrations in order (excluding 001 already handled)
  if (fs.existsSync(migDir)) {
    const files = fs
      .readdirSync(migDir)
      .filter(f => f.endsWith('.sql') && f !== '001_enable_pgcrypto.sql')
      .filter(f => {
        if (hasNormalized) {
          // Skip legacy migrations when normalized schema exists
          return !['002_create_event_ack.sql','003_create_device_command_log.sql','004_event_ack_unique.sql'].includes(f);
        }
        return true;
      })
      .sort();
    for (const f of files) {
      const fname = `migrations/${f}`;
      if (await hasMigration(fname)) {
        console.log('Skip', fname);
        continue;
      }
      const sql = fs.readFileSync(path.join(migDir, f), 'utf8');
      await applyMigration(fname, sql);
    }
  }
  await pool.end();
}
run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
