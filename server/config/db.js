const { Pool } = require('pg');
require('dotenv').config();

let connectionString;
if (process.env.NODE_ENV === 'production') {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required in production');
  }
  connectionString = process.env.DATABASE_URL;
} else {
  connectionString = process.env.DATABASE_URL || `postgres://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:5432/${process.env.DB_NAME || 'plainstore'}`;
}
const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const wrapper = {
  isDbAvailable: true,
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
      console.error('Database Query Error:', err.message);
      // Propagate error – no mock fallback in production
      throw err;
    }
  },
  getConnection: async () => {
    if (!wrapper.isDbAvailable) {
      // Fallback disabled – always attempt real DB connection
      // If connection fails, it will be thrown and handled by the caller
      return {
        query: async () => { throw new Error('Database not available'); },
        beginTransaction: async () => { throw new Error('Database not available'); },
        commit: async () => { throw new Error('Database not available'); },
        rollback: async () => { throw new Error('Database not available'); },
        release: () => {}
      };
    }
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
      beginTransaction: async () => await client.query('BEGIN'),
      commit: async () => await client.query('COMMIT'),
      rollback: async () => await client.query('ROLLBACK'),
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
