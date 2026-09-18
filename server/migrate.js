require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  try {
    const sqlPath = path.join(__dirname, '..', 'database.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Running database migrations...');
    await connection.query(sql);
    console.log('Database migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.end();
  }
}

migrate();
