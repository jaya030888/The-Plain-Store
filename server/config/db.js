const net = require('net');
const dns = require('dns');
if (net.setDefaultAutoSelectFamily) {
  net.setDefaultAutoSelectFamily(false);
}
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const { Pool } = require('pg');
require('dotenv').config();

function needsSsl(connectionString) {
  if (!connectionString) return false;
  const local = /localhost|127\.0\.0\.1/i.test(connectionString);
  return !local;
}

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
  ssl: needsSsl(connectionString) ? { rejectUnauthorized: false } : false,
  max: parseInt(process.env.DB_POOL_MAX || '20', 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  allowExitOnIdle: false
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client pool:', err.message);
});

const convertPlaceholders = (sql, params) => {
  let pgSql = sql ? sql.trim() : '';
  if (params && params.length > 0) {
    let index = 1;
    pgSql = pgSql.replace(/\?/g, () => `$${index++}`);
  }
  const isInsert = pgSql.toUpperCase().startsWith('INSERT');
  if (isInsert && !pgSql.toUpperCase().includes('RETURNING')) {
    pgSql = pgSql.replace(/;+\s*$/, '');
    pgSql += ' RETURNING id';
  }
  return { pgSql, isInsert };
};

const formatResult = (result, isInsert, pgSql) => {
  const rows = result.rows;
  if (isInsert && rows.length > 0 && rows[0].id) {
    rows.insertId = rows[0].id;
  }
  const isSelect = pgSql.trim().toUpperCase().startsWith('SELECT');
  if (!isInsert && !isSelect) {
    return [{ affectedRows: result.rowCount }, result.fields];
  }
  return [rows, result.fields];
};

const wrapQuery = (executor) => async (sql, params = []) => {
  const { pgSql, isInsert } = convertPlaceholders(sql, params);
  try {
    const result = await executor(pgSql, params);
    return formatResult(result, isInsert, pgSql);
  } catch (err) {
    if (err.message && (err.message.includes('terminated') || err.message.includes('timeout') || err.message.includes('closed') || err.message.includes('Connection'))) {
      console.warn('Database query failed with connection issue, retrying once...', err.message);
      try {
        const result = await executor(pgSql, params);
        return formatResult(result, isInsert, pgSql);
      } catch (retryErr) {
        console.error('Database Query Error on retry:', retryErr.message);
        throw retryErr;
      }
    }
    console.error('Database Query Error:', err.message);
    throw err;
  }
};

const wrapper = {
  isDbAvailable: true,
  query: wrapQuery((sql, params) => pool.query(sql, params)),
  getConnection: async () => {
    const client = await pool.connect();
    return {
      query: wrapQuery((sql, params) => client.query(sql, params)),
      beginTransaction: async () => client.query('BEGIN'),
      commit: async () => client.query('COMMIT'),
      rollback: async () => client.query('ROLLBACK'),
      release: () => client.release(),
    };
  },
  ping: async () => {
    await pool.query('SELECT 1');
  },
};

module.exports = wrapper;
module.exports.needsSsl = needsSsl;
module.exports.pool = pool;
