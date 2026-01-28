
const sql = require('mssql');

const config = {
  user: process.env.SQL_SERVER_USER,
  password: process.env.SQL_SERVER_PASSWORD,
  server: process.env.SQL_SERVER_HOST,
  database: process.env.SQL_SERVER_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

console.log('Testing connection with config:', { ...config, password: '***' });

async function run() {
  try {
    const pool = await new sql.ConnectionPool(config).connect();
    console.log('Connected successfully!');
    const result = await pool.request().query('SELECT 1 as val');
    console.log('Query result:', result.recordset);
    pool.close();
  } catch (err) {
    console.error('Connection failed:', err);
  }
}

run();
