const { pool } = require('../config/db');

async function checkData() {
  try {
    console.log('🔍 Checking for existing data...');
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully');
    
    // Check if tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('📋 Existing tables:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Check for users
    try {
      const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
      console.log(`👥 Users in database: ${usersResult.rows[0].count}`);
      
      if (usersResult.rows[0].count > 0) {
        const userDetails = await pool.query('SELECT username, email, role_name FROM users LIMIT 5');
        console.log('📝 User details:');
        userDetails.rows.forEach(user => {
          console.log(`  - ${user.username} (${user.email}) - ${user.role_name}`);
        });
      }
    } catch (err) {
      console.log('ℹ️  Users table does not exist or is empty');
    }
    
    // Check for companies
    try {
      const companiesResult = await pool.query('SELECT COUNT(*) as count FROM companies');
      console.log(`🏢 Companies in database: ${companiesResult.rows[0].count}`);
    } catch (err) {
      console.log('ℹ️  Companies table does not exist or is empty');
    }
    
    console.log('✅ Data check completed');
    
  } catch (error) {
    console.error('❌ Error checking data:', error.message);
    console.log('\n💡 This means Postgres.app authentication is still not fixed.');
    console.log('Please follow the steps in fix_postgres.md');
  } finally {
    await pool.end();
  }
}

checkData();



