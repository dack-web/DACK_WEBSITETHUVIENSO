require('dotenv').config();
const mysql = require('mysql2/promise');

async function repair() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "library_db"
    });

    try {
        console.log("--- Checking ISBN column ---");
        const [rows] = await connection.query("SHOW COLUMNS FROM books LIKE 'isbn'");
        
        if (rows.length === 0) {
            console.log("Adding isbn column...");
            await connection.query("ALTER TABLE books ADD COLUMN isbn VARCHAR(50) UNIQUE AFTER published_year");
            console.log("✅ Column added.");
        } else {
            console.log("ℹ️ ISBN column already exists.");
        }

        console.log("--- Final table structure ---");
        const [structure] = await connection.query("DESCRIBE books");
        console.table(structure);

    } catch (error) {
        console.error("❌ REPAIR FAILED:", error);
    } finally {
        await connection.end();
        process.exit();
    }
}

repair();
