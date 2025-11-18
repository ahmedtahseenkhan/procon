#!/usr/bin/env node

const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const backgroundSync = require('../services/backgroundSync');

async function run() {
  const [, , accountArg, startArg, endArg] = process.argv;
  const accountId = accountArg || process.env.PROCON_ACCOUNT_ID;
  const startDate = startArg || undefined;
  const endDate = endArg || undefined;

  if (!accountId) {
    console.error('Missing accountId. Provide as first argument or set PROCON_ACCOUNT_ID.');
    process.exit(1);
  }

  console.log('Starting Procon sync window with params:', {
    accountId,
    startDate,
    endDate,
  });

  try {
    await backgroundSync.syncWindow({ accountId, startDate, endDate });
    console.log('✅ Procon sync window completed successfully');
  } catch (err) {
    console.error('❌ Procon sync window failed:', err.message || err);
    process.exit(1);
  }
}

run();
