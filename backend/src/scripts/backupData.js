const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

async function backupData() {
  console.log('🔄 Attempting to backup your data...');
  
  try {
    // Try to connect using Postgres.app tools directly
    const psqlPath = '/Applications/Postgres.app/Contents/Versions/latest/bin/psql';
    
    console.log('📋 Listing databases...');
    exec(`${psqlPath} -d postgres -c "\\l"`, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error:', error.message);
        console.log('\n💡 Postgres.app authentication issue persists.');
        console.log('Please follow these steps:');
        console.log('1. Open Postgres.app');
        console.log('2. Click the elephant icon in your menu bar');
        console.log('3. Go to Settings/Preferences');
        console.log('4. Find "App Permissions" section');
        console.log('5. Add Cursor to trusted applications');
        console.log('6. Or change authentication from "trust" to "md5"');
        return;
      }
      
      console.log('✅ Successfully connected!');
      console.log('📋 Available databases:');
      console.log(stdout);
      
      // Try to list tables in procon_gaming database
      console.log('\n📋 Checking procon_gaming database...');
      exec(`${psqlPath} -d procon_gaming -c "\\dt"`, (error, stdout, stderr) => {
        if (error) {
          console.log('ℹ️  procon_gaming database might not exist yet');
          console.log('This is normal if you haven\'t created it yet.');
        } else {
          console.log('✅ procon_gaming database found!');
          console.log('📋 Tables in procon_gaming:');
          console.log(stdout);
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

backupData();



