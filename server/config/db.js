const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const wrapper = {
  query: async (sql, params = []) => {
    let pgSql = sql;
    if (params && params.length > 0) {
      let index = 1;
      pgSql = sql.replace(/\?/g, () => `$${index++}`);
    }
    
    const isInsert = pgSql.trim().toUpperCase().startsWith('INSERT');
    if (isInsert && !pgSql.toUpperCase().includes('RETURNING')) {
        pgSql += ' RETURNING id';
    }

    try {
      const result = await pool.query(pgSql, params);
      const rows = result.rows;
      
      if (isInsert && rows.length > 0 && rows[0].id) {
          rows.insertId = rows[0].id;
      }
      
      const isSelect = pgSql.trim().toUpperCase().startsWith('SELECT');
      if (!isInsert && !isSelect) {
          return [{ affectedRows: result.rowCount }, result.fields];
      }
      
      return [rows, result.fields];
    } catch (err) {
      console.error('Database Query Error:', err.message, '\nQuery:', pgSql);
      throw err;
    }
  },
  getConnection: async () => {
    const client = await pool.connect();
    return {
      query: async (sql, params = []) => {
         let pgSql = sql;
         if (params && params.length > 0) {
           let index = 1;
           pgSql = sql.replace(/\?/g, () => `$${index++}`);
         }
         const isInsert = pgSql.trim().toUpperCase().startsWith('INSERT');
         if (isInsert && !pgSql.toUpperCase().includes('RETURNING')) {
             pgSql += ' RETURNING id';
         }
         const result = await client.query(pgSql, params);
         const rows = result.rows;
         if (isInsert && rows.length > 0 && rows[0].id) {
             rows.insertId = rows[0].id;
         }
         const isSelect = pgSql.trim().toUpperCase().startsWith('SELECT');
         if (!isInsert && !isSelect) {
             return [{ affectedRows: result.rowCount }, result.fields];
         }
         return [rows, result.fields];
      },
      release: () => client.release()
    };
  }
};

// Test connection
pool.query('SELECT NOW()')
  .then(() => {
    console.log('Successfully connected to PostgreSQL database.');
  })
  .catch(err => {
    console.error('Error connecting to PostgreSQL database:', err.message);
    console.log('Please ensure PostgreSQL is running and DATABASE_URL is correct.');
  });

module.exports = wrapper;
