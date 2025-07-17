#!/usr/bin/env node

/**
 * Reset user counts for users who exceeded the new starter plan limit
 * 
 * This script resets the brief counts for users who had more than 50 briefs
 * under the old 100-brief starter plan, giving them a fresh start.
 * 
 * Run with: node scripts/reset-user-counts.js
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function resetUserCounts() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting user count reset for plan limit migration...');
    
    // Find users who exceed the new starter limit (50)
    const excessUsersResult = await client.query(`
      SELECT 
        u.id,
        u.email,
        s.plan,
        ubc.current_month_count,
        ubc.current_month_start,
        ubc.total_count
      FROM "user" u
      JOIN user_brief_counts ubc ON ubc.user_id = u.id
      LEFT JOIN subscription s ON s."referenceId" = u.id
      WHERE ubc.current_month_count > 50
      AND (s.plan = 'starter' OR s.plan IS NULL)
      AND u.email NOT LIKE 'anonymous+%'
      ORDER BY ubc.current_month_count DESC
    `);
    
    console.log(`📊 Found ${excessUsersResult.rows.length} users with >50 briefs this month`);
    
    if (excessUsersResult.rows.length === 0) {
      console.log('✅ No users need count reset');
      return;
    }
    
    console.log('\n👥 Users to reset:');
    excessUsersResult.rows.forEach(user => {
      console.log(`  ${user.email}: ${user.current_month_count} briefs (${user.plan || 'free'} plan)`);
    });
    
    // Prompt for confirmation
    console.log('\n⚠️  This will reset current month counts to 0 for these users');
    console.log('Are you sure you want to proceed? (y/N)');
    
    // In a real environment, you'd want to add readline for confirmation
    // For now, comment out the actual reset and just log
    
    const CONFIRM_RESET = false; // Set to true to actually reset
    
    if (!CONFIRM_RESET) {
      console.log('🔒 Reset disabled for safety. Set CONFIRM_RESET = true to execute');
      console.log('\n📋 To reset manually, run these SQL commands:');
      
      for (const user of excessUsersResult.rows) {
        console.log(`-- Reset ${user.email} (${user.current_month_count} -> 0)`);
        console.log(`UPDATE user_brief_counts SET current_month_count = 0 WHERE user_id = '${user.id}';`);
      }
      
      return;
    }
    
    // Actually reset the counts
    let resetCount = 0;
    for (const user of excessUsersResult.rows) {
      try {
        await client.query(`
          UPDATE user_brief_counts 
          SET current_month_count = 0,
              current_month_start = CURRENT_DATE
          WHERE user_id = $1
        `, [user.id]);
        
        console.log(`✅ Reset ${user.email}: ${user.current_month_count} -> 0`);
        resetCount++;
      } catch (error) {
        console.error(`❌ Failed to reset ${user.email}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Reset completed for ${resetCount} users`);
    
  } catch (error) {
    console.error('❌ Reset failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the reset
if (require.main === module) {
  resetUserCounts()
    .then(() => {
      console.log('🎉 Reset script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Reset script failed:', error);
      process.exit(1);
    });
}

module.exports = { resetUserCounts };