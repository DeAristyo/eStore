const mysql = require('mysql');
require('dotenv').config();

const db = mysql.createConnection({
    user: process.env.DB_UNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    multipleStatements: true
});

db.connect((err) => {
    if (err) {
        return console.log(`error: ${err.message}`);
    }
    console.log(`Connected to database`);
});

module.exports = { db };