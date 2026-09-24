const db = require('./config/db');

async function migrateUsersTable() {
  console.log('--- Migrating Users table for Customer Management ---');
  try {
    // Add is_blocked and is_deleted columns if not present
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
    `);
    console.log('[OK] Added is_blocked and is_deleted columns to users table.');

    // Create index on is_blocked and is_deleted
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_users_is_blocked ON users(is_blocked);
      CREATE INDEX IF NOT EXISTS idx_users_is_deleted ON users(is_deleted);
    `);
    console.log('[OK] Created indexes for is_blocked and is_deleted.');

    console.log('--- Customer Management DB Migration Complete ---');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrateUsersTable();
