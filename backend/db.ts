import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "usuario",
  password: "usuario",
  database: "across",
});
export default pool;