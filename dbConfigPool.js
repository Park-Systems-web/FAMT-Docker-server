const mysql = require("mysql2/promise");

const famtPool = mysql.createPool({
  host: "ec2-18-144-161-137.us-west-1.compute.amazonaws.com",
  user: "root",
  password: process.env.DB_PASS,
  port: "3307",
  database: "famt",
  connectionLimit: 30,
});

module.exports.famtPool = famtPool;
