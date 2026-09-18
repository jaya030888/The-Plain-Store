const mysql = require('mysql2/promise');

async function testPasswords() {
  const passwords = ['', 'root', 'password', '1234', '123456', 'admin'];
  for (let pwd of passwords) {
    try {
      console.log(`Trying password: '${pwd}'`);
      const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: pwd
      });
      console.log(`SUCCESS with password: '${pwd}'`);
      await connection.end();
      return;
    } catch (e) {
      // failed
    }
  }
  console.log('All common passwords failed.');
}

testPasswords();
