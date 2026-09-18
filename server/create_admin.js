const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdmin() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'the_plain_store'
    });

    const [admins] = await connection.query("SELECT email FROM users WHERE role='admin'");
    if (admins.length > 0) {
      console.log('Admin already exists with email:', admins[0].email);
      // Let's reset the password to 'admin123' just in case they forgot
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await connection.query("UPDATE users SET password_hash = ? WHERE email = ?", [hashedPassword, admins[0].email]);
      console.log('Password reset to: admin123');
    } else {
      const email = 'admin@theplainstore.com';
      const password = 'admin123';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      await connection.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['Admin User', email, hashedPassword, 'admin']
      );
      
      console.log('Created new admin user!');
      console.log('Email:', email);
      console.log('Password:', password);
    }

    await connection.end();
  } catch (err) {
    console.error(err);
  }
}

createAdmin();
