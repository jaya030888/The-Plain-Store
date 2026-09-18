const db = require('./config/db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdmin() {
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@theplainstore.com';
    const password = process.env.ADMIN_PASSWORD;
    if (!password) {
      console.error('Set ADMIN_PASSWORD in the environment to create or reset an admin user.');
      process.exit(1);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const [admins] = await db.query("SELECT email FROM users WHERE role='admin'");

    if (admins.length > 0) {
      await db.query('UPDATE users SET password_hash = ? WHERE email = ?', [hashedPassword, admins[0].email]);
      console.log('Admin password updated for', admins[0].email);
    } else {
      await db.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
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
