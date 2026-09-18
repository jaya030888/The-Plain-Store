const db = require('./config/db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdmin() {
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@theplainstore.com';
    const password = process.env.ADMIN_PASSWORD || 'admin123';

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Check whether the requested admin email already exists
    const [admins] = await db.query(
      'SELECT id, email FROM users WHERE email = ?',
      [email]
    );

    if (admins.length > 0) {
      // Reset this exact admin account
      await db.query(
        `UPDATE users
         SET password_hash = ?, role = 'admin'
         WHERE email = ?`,
        [hashedPassword, email]
      );

      console.log('Admin account updated:', email);
    } else {
      // Create the requested admin account
      await db.query(
        `INSERT INTO users
         (name, email, password_hash, role)
         VALUES (?, ?, ?, ?)`,
        ['Admin User', email, hashedPassword, 'admin']
      );

      console.log('Created admin user:', email);
    }

    process.exit(0);
  } catch (err) {
    console.error('Failed to create admin:', err.message);
    process.exit(1);
  }
}

createAdmin();