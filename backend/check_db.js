console.log("Starting check_db.js...");
require("dotenv").config();
const { query } = require("./config/db_config");

async function checkBooks() {
    try {
        console.log("--- BOOKS TABLE STRUCTURE ---");
        const columns = await query("DESCRIBE books");
        console.log(JSON.stringify(columns, null, 2));

        console.log("--- BORROWS TABLE STRUCTURE ---");
        const borrowCols = await query("DESCRIBE borrows");
        console.log(JSON.stringify(borrowCols, null, 2));

        const rows = await query("SELECT * FROM books LIMIT 1");
        console.log("Sample Book Data:", JSON.stringify(rows, null, 2));
    } catch (error) {
        console.error("DB Error:", error);
    } finally {
        process.exit();
    }
}

checkBooks();
