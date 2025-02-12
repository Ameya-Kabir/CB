const sql = require("mysql2");
const dotenv = require("dotenv").config();
const db = sql.createConnection({
  host: "sql.freedb.tech",
  user: "freedb_bakery",
  password: "cu*%P%4dDHXh8ct",
  database: "freedb_crown_bakers",
  port: 3306,
  authPlugins: {
    mysql_clear_password: () => () => Buffer.from("cu*%P%4dDHXh8ct"),
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = db;
