const db = require('./config/db');

async function migrateReturns() {
  try {
    console.log('Migrating Returns schema in PostgreSQL...');
    
    // 1. Add return columns to orders table
    await db.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS return_status VARCHAR(50) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS return_reason TEXT DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS return_requested_at TIMESTAMP DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS return_notes TEXT DEFAULT NULL;
    `);

    // 2. Create order_returns table
    await db.query(`
      CREATE TABLE IF NOT EXISTS order_returns (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id),
        reason VARCHAR(255) NOT NULL,
        details TEXT,
        status VARCHAR(50) DEFAULT 'return_requested',
        admin_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Returns schema migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrateReturns();
