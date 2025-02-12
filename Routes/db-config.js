const sql = require("mysql2");
const dotenv = require("dotenv").config();
const db = sql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
  authPlugins: {
    mysql_clear_password: () => () =>
      Buffer.from(process.env.DATABASE_PASSWORD),
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = db;
