require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixAll() {
    const config = {
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "library_db"
    };

    let connection;
    try {
        console.log("🚀 Connecting to database...");
        connection = await mysql.createConnection(config);

        console.log("📦 Checking 'books' table...");
        const [columns] = await connection.query("SHOW COLUMNS FROM books");
        const hasIsbn = columns.some(c => c.Field === 'isbn');

        if (!hasIsbn) {
            console.log("➕ Adding 'isbn' column...");
            // Thêm cột isbn và cho phép NULL (để tránh lỗi duplicate nếu có nhiều giá trị trống ban đầu)
            await connection.query("ALTER TABLE books ADD COLUMN isbn VARCHAR(50) UNIQUE AFTER published_year");
            console.log("✅ 'isbn' column added.");
        } else {
            console.log("ℹ️ 'isbn' column already exists.");
            
            // Xử lý trường hợp có các giá trị rỗng chuỗi '' thay vì NULL trong cột UNIQUE
            console.log("🧹 Normalizing ISBN data (replacing '' with NULL)...");
            await connection.query("UPDATE books SET isbn = NULL WHERE isbn = ''");
            console.log("✅ Data normalized.");
        }

        console.log("📁 Checking upload directories...");
        const fs = require('fs');
        const dirs = ['uploads', 'uploads/book_covers', 'uploads/pdfs'];
        dirs.forEach(d => {
            if (!fs.existsSync(d)) {
                fs.mkdirSync(d, { recursive: true });
                console.log(`✅ Created directory: ${d}`);
            }
        });

        console.log("🎉 ALL FIXES APPLIED SUCCESSFULLY!");

    } catch (error) {
        console.error("❌ ERROR DURING FIX:", error);
    } finally {
        if (connection) await connection.end();
        process.exit();
    }
}

fixAll();
