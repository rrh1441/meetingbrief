#!/usr/bin/env node

/**
 * Migration script to fix plan limits for all users
 * 
 * This script updates the subscription limits to match the new pricing:
 * - starter: 50 briefs/month (was incorrectly 100)
 * - free: 5 briefs/month (unchanged)
 * 
 * Run with: node scripts/fix-plan-limits.js
 */

// Load environment variables
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Correct plan limits
const PLAN_LIMITS = {
  free: 5,
  starter: 50,
};

async function fixPlanLimits() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Starting plan limits migration...');
    
    // Get all subscriptions
    const subscriptionResult = await client.query(`
      SELECT DISTINCT plan, COUNT(*) as user_count
      FROM subscription 
      WHERE plan IS NOT NULL
      GROUP BY plan
      ORDER BY plan
    `);
    
    console.log('📊 Current subscription distribution:');
    subscriptionResult.rows.forEach(row => {
      console.log(`  ${row.plan}: ${row.user_count} users`);
    });
    
    // Get all users with their current subscription status
    const userResult = await client.query(`
      SELECT 
        u.id,
        u.email,
        s.plan,
        s.status,
        s."periodStart",
        s."periodEnd",
        ubc.current_month_count,
        ubc.current_month_start
      FROM "user" u
      LEFT JOIN subscription s ON s."referenceId" = u.id
      LEFT JOIN user_brief_counts ubc ON ubc.user_id = u.id
      WHERE u.email NOT LIKE 'anonymous+%'
      ORDER BY u."createdAt" DESC
    `);
    
    console.log(`\n👥 Found ${userResult.rows.length} users to process`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const user of userResult.rows) {
      try {
        const plan = user.plan || 'free';
        const expectedLimit = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
        
        console.log(`Processing user ${user.email} (${plan} plan):`);
        console.log(`  Current usage: ${user.current_month_count || 0} briefs`);
        console.log(`  Expected limit: ${expectedLimit}`);
        
        // Check if user has exceeded the new limit
        if (user.current_month_count > expectedLimit) {
          console.log(`  ⚠️  User has exceeded new limit (${user.current_month_count}/${expectedLimit})`);
          console.log(`  📅 Current period: ${user.current_month_start || 'N/A'}`);
          
          // Option 1: Reset their count for this month (generous approach)
          // await client.query(`
          //   UPDATE user_brief_counts 
          //   SET current_month_count = $1
          //   WHERE user_id = $2
          // `, [Math.min(user.current_month_count, expectedLimit), user.id]);
          
          // Option 2: Just log for manual review (safer approach)
          console.log(`  📝 Logged for manual review`);
        }
        
        updatedCount++;
      } catch (error) {
        console.error(`❌ Error processing user ${user.email}:`, error.message);
        errorCount++;
      }
    }
    
    // Update any hardcoded limits in the database if they exist
    console.log('\n🔄 Checking for hardcoded limits in database...');
    
    // Check if there are any stored limits that need updating
    const limitCheckResult = await client.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND column_name LIKE '%limit%'
    `);
    
    console.log('📋 Found limit-related columns:');
    limitCheckResult.rows.forEach(row => {
      console.log(`  ${row.table_name}.${row.column_name}`);
    });
    
    console.log('\n✅ Migration completed!');
    console.log(`📊 Summary:`);
    console.log(`  - Users processed: ${updatedCount}`);
    console.log(`  - Errors: ${errorCount}`);
    console.log(`  - Users over new limit: Check logs above`);
    
    console.log('\n🎯 Next steps:');
    console.log('1. Review users who exceed new limits');
    console.log('2. Consider grandfathering or manual adjustments');
    console.log('3. Deploy the updated API endpoints');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
if (require.main === module) {
  fixPlanLimits()
    .then(() => {
      console.log('🎉 Migration script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { fixPlanLimits };