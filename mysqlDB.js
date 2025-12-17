var mysql = require('mysql2/promise');
require('dotenv').config();

var pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

pool.on('error', (err) => {
    console.error('An unexpected error occurred in the DB pool: ', err);
});

// 서버 시작 시 DB 연결 테스트
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ DB is successfully connected!');
        connection.release();
    } catch (err) {
        console.error('❌ DB connection failed: ', err);
    }
}

testConnection();

module.exports = pool;