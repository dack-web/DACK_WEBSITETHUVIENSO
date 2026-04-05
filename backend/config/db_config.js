const mysql = require("mysql2/promise");
require("dotenv").config();

/*
  Tạo database nếu chưa có
*/
const initDatabase = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);

    await connection.end();

    console.log(`✅ Database ${process.env.DB_NAME} ready`);
};

/*
  Kết nối MySQL bằng Connection Pool

  Best practice:
  - sử dụng connection pool để tối ưu hiệu năng
  - tự động reconnect khi cần
  - dùng async/await thay vì callback
*/

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost", // địa chỉ database
    user: process.env.DB_USER || "root", // username MySQL
    password: process.env.DB_PASSWORD || "", // mật khẩu MySQL
    database: process.env.DB_NAME || "library_db",
    timezone: "+07:00",

    waitForConnections: true, // nếu hết connection thì chờ
    connectionLimit: 10, // tối đa 10 connection
    queueLimit: 0, // không giới hạn hàng chờ

    connectTimeout: 10000, // timeout kết nối (10s)
    enableKeepAlive: true, // giữ kết nối sống
});

/*
  Hàm kiểm tra kết nối database
*/
const testConnection = async () => {
    try {
        const connection = await pool.getConnection(); // lấy connection từ pool
        console.log("✅ MySQL Connected");
        connection.release(); // trả connection lại pool
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        process.exit(1); // dừng server nếu DB lỗi
    }
};

/*
  Hàm helper để thực hiện query database
*/
const query = async (sql, params = []) => {
    if (!pool) {
        throw new Error("Database pool not initialized");
    }

    try {
        const [rows] = await pool.query(sql, params);
        return rows;
    } catch (error) {
        console.error("DB Query Error:", {
            sql,
            params,
            message: error.message,
        });
        throw error;
    }
};

/*
  Helper để thực hiện transaction
  dùng khi cần nhiều query chạy cùng lúc
*/
const transaction = async (callback) => {
    const connection = await pool.getConnection(); // lấy connection

    try {
        await connection.beginTransaction(); // bắt đầu transaction

        const result = await callback(connection); // chạy các query

        await connection.commit(); // commit nếu thành công
        return result;
    } catch (error) {
        await connection.rollback(); // rollback nếu lỗi
        throw error;
    } finally {
        connection.release(); // trả connection lại pool
    }
};

module.exports = {
    initDatabase,
    pool,
    query,
    transaction,
    testConnection,
};
