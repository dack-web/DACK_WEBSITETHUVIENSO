require("dotenv").config();
const { query } = require("./config/db_config");

async function migrate() {
    try {
        console.log("Starting ISBN migration...");
        await query("ALTER TABLE books ADD COLUMN isbn VARCHAR(50) UNIQUE AFTER published_year");
        console.log("✅ ISBN column added successfully!");
    } catch (error) {
        if (error.code === 'ER_DUP_COLUMN_NAME') {
            console.log("ℹ️ ISBN column already exists.");
        } else {
            console.error("❌ Migration failed:", error);
        }
    } finally {
        process.exit();
    }
}

migrate();
