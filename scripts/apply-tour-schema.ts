#!/usr/bin/env tsx

/**
 * Применение Tour System Schema к Timeweb Cloud БД
 */

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// Database credentials
const pool = new Pool({
  host: '51e6e5ca5d967b8e81fc9b75.twc1.net',
  port: 5432,
  database: 'default_db',
  user: 'gen_user',
  password: 'q;3U+PY7XCz@Br',
  ssl: {
    rejectUnauthorized: false  // Timeweb Cloud uses self-signed certs
  },
  max: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

async function main() {
  console.log('🚀 Tour System Schema Deployment');
  console.log('==================================\n');

  try {
    // Test connection
    console.log('🔍 Testing database connection...');
    const testResult = await pool.query('SELECT version()');
    console.log('✅ Database connection successful');
    console.log(`   PostgreSQL: ${testResult.rows[0].version.split(',')[0]}\n`);

    // Check existing tables
    console.log('📦 Checking existing tables...');
    const tablesResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name LIKE 'tour_%'
    `);
    const existingTables = parseInt(tablesResult.rows[0].count);
    console.log(`   Found ${existingTables} tour-related tables\n`);

    if (existingTables > 0) {
      console.log('⚠️  Warning: Tour tables already exist');
      console.log('   This will create/update tables\n');
    }

    // Read schema file
    console.log('📖 Reading tour_system_schema.sql...');
    const schemaPath = path.join(process.cwd(), 'lib', 'database', 'tour_system_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log(`   File size: ${(schema.length / 1024).toFixed(2)} KB\n`);

    // Create extensions first
    console.log('🔧 Creating required extensions...');
    try {
      await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      console.log('   ✅ uuid-ossp extension created');
    } catch (error: any) {
      console.log(`   ⚠️  ${error.message}`);
    }
    
    try {
      await pool.query('CREATE EXTENSION IF NOT EXISTS "postgis"');
      console.log('   ✅ postgis extension created');
    } catch (error: any) {
      console.log(`   ⚠️  postgis extension may not be available: ${error.message}`);
    }
    console.log('');

    // Apply schema
    console.log('🔧 Applying schema...');
    await pool.query(schema);
    console.log('✅ Schema applied successfully\n');

    // Verify tables
    console.log('🔍 Verifying tables...');
    const verifyTables = await pool.query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns 
              WHERE table_schema = 'public' AND table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' AND table_name LIKE 'tour_%'
      ORDER BY table_name
    `);

    console.log('\n📊 Created tables:');
    for (const row of verifyTables.rows) {
      const countResult = await pool.query(`SELECT COUNT(*) FROM ${row.table_name}`);
      console.log(`   ✅ ${row.table_name} (${row.column_count} columns, ${countResult.rows[0].count} rows)`);
    }

    // Verify functions
    console.log('\n🔍 Verifying functions...');
    const functionsResult = await pool.query(`
      SELECT routine_name
      FROM information_schema.routines
      WHERE routine_schema = 'public' AND routine_name LIKE '%tour%'
      ORDER BY routine_name
    `);

    console.log('\n📊 Created functions:');
    for (const row of functionsResult.rows) {
      console.log(`   ✅ ${row.routine_name}()`);
    }

    // Verify indexes
    console.log('\n🔍 Verifying indexes...');
    const indexesResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM pg_indexes
      WHERE schemaname = 'public' AND tablename LIKE 'tour_%'
    `);
    console.log(`   ✅ ${indexesResult.rows[0].count} indexes created`);

    console.log('\n🎉 Tour System Schema deployed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Update .env.production with DATABASE_URL');
    console.log('   2. Test API endpoints');
    console.log('   3. Create test tour schedules');
    console.log('   4. Run tests');
    console.log('\n🚀 Database is ready for Tour System!');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    if (error.detail) {
      console.error(`   Detail: ${error.detail}`);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run
main().catch(console.error);
