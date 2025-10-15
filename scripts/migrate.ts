#!/usr/bin/env tsx

import { runMigrations, rollbackMigrations, getMigrationStatus } from '../lib/database/migrations';

// Парсим аргументы командной строки
const args = process.argv.slice(2);
const command = args[0];

async function main() {
  try {
    switch (command) {
      case 'up':
        console.log('🚀 Running migrations...');
        await runMigrations();
        break;
        
      case 'down':
        const targetVersion = args[1];
        console.log('🔄 Rolling back migrations...');
        await rollbackMigrations(targetVersion);
        break;
        
      case 'status':
        console.log('📊 Checking migration status...');
        const status = await getMigrationStatus();
        console.log(`\n📈 Migration Status:`);
        console.log(`   Total migrations: ${status.total}`);
        console.log(`   Executed: ${status.executed.length}`);
        console.log(`   Pending: ${status.pending.length}`);
        
        if (status.executed.length > 0) {
          console.log(`\n✅ Executed migrations:`);
          status.executed.forEach(version => console.log(`   - ${version}`));
        }
        
        if (status.pending.length > 0) {
          console.log(`\n⏳ Pending migrations:`);
          status.pending.forEach(version => console.log(`   - ${version}`));
        }
        break;
        
      default:
        console.log('❌ Unknown command. Available commands:');
        console.log('   up      - Run all pending migrations');
        console.log('   down    - Rollback migrations (optionally to specific version)');
        console.log('   status  - Show migration status');
        console.log('\nUsage:');
        console.log('   npm run migrate up');
        console.log('   npm run migrate down');
        console.log('   npm run migrate down 003');
        console.log('   npm run migrate status');
        process.exit(1);
    }
    
    console.log('\n🎉 Command completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Command failed:', error);
    process.exit(1);
  }
}

// Запускаем только если файл выполняется напрямую
if (require.main === module) {
  main();
}