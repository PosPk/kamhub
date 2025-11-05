#!/usr/bin/env tsx

/**
 * Полный деплой схемы Kamchatour Hub + Tour System
 */

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({
  host: '51e6e5ca5d967b8e81fc9b75.twc1.net',
  port: 5432,
  database: 'default_db',
  user: 'gen_user',
  password: 'q;3U+PY7XCz@Br',
  ssl: {
    rejectUnauthorized: false
  },
  max: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

async function main() {
  console.log('🚀 Kamchatour Hub + Tour System - Full Schema Deployment');
  console.log('=========================================================\n');

  try {
    // Test connection
    console.log('🔍 Testing database connection...');
    const testResult = await pool.query('SELECT version()');
    console.log('✅ Database connection successful');
    console.log(`   PostgreSQL: ${testResult.rows[0].version.split(',')[0]}\n`);

    // Create extensions
    console.log('🔧 Creating extensions...');
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    console.log('   ✅ uuid-ossp extension\n');

    // Apply base schema (without PostGIS for Timeweb)
    console.log('📖 Step 1: Applying base schema (schema_simple.sql)...');
    const baseSchemaPath = path.join(process.cwd(), 'lib', 'database', 'schema_simple.sql');
    const baseSchema = fs.readFileSync(baseSchemaPath, 'utf8');
    
    await pool.query(baseSchema);
    console.log('✅ Base schema applied\n');

    // Verify base tables
    const baseTablesResult = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' 
        AND table_name IN ('users', 'partners', 'tours', 'bookings')
      ORDER BY table_name
    `);
    console.log('📊 Base tables created:');
    for (const row of baseTablesResult.rows) {
      console.log(`   ✅ ${row.table_name}`);
    }
    console.log('');

    // Apply tour system schema
    console.log('📖 Step 2: Applying tour system schema (tour_system_schema.sql)...');
    const tourSchemaPath = path.join(process.cwd(), 'lib', 'database', 'tour_system_schema.sql');
    const tourSchema = fs.readFileSync(tourSchemaPath, 'utf8');
    
    await pool.query(tourSchema);
    console.log('✅ Tour system schema applied\n');

    // Verify tour tables
    const tourTablesResult = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name LIKE 'tour_%'
      ORDER BY table_name
    `);
    console.log('📊 Tour system tables:');
    for (const row of tourTablesResult.rows) {
      const countResult = await pool.query(`SELECT COUNT(*) FROM ${row.table_name}`);
      console.log(`   ✅ ${row.table_name} (${countResult.rows[0].count} rows)`);
    }
    console.log('');

    // Count all tables
    const allTablesResult = await pool.query(`
      SELECT COUNT(*) as count FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    console.log(`📊 Total tables created: ${allTablesResult.rows[0].count}`);

    // Count functions
    const functionsResult = await pool.query(`
      SELECT COUNT(*) as count FROM information_schema.routines
      WHERE routine_schema = 'public'
    `);
    console.log(`📊 Total functions: ${functionsResult.rows[0].count}`);

    // Count indexes
    const indexesResult = await pool.query(`
      SELECT COUNT(*) as count FROM pg_indexes
      WHERE schemaname = 'public'
    `);
    console.log(`📊 Total indexes: ${indexesResult.rows[0].count}\n`);

    console.log('🎉 Full schema deployed successfully!\n');
    console.log('📝 Next steps:');
    console.log('   1. Create test data');
    console.log('   2. Test API endpoints');
    console.log('   3. Deploy application');
    console.log('\n🚀 Database is ready!');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    if (error.detail) {
      console.error(`   Detail: ${error.detail}`);
    }
    if (error.where) {
      console.error(`   Where: ${error.where}`);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
