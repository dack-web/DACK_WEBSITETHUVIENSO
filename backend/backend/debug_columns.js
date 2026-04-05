require('dotenv').config();
const { query } = require('./config/db_config');

async function check() {
    try {
        const cols = await query('DESCRIBE books');
        console.log("=== COLUMNS IN BOOKS ===");
        console.log(JSON.stringify(cols, null, 2));
        
        const borrows = await query('DESCRIBE borrows');
        console.log("=== COLUMNS IN BORROWS ===");
        console.log(JSON.stringify(borrows, null, 2));
    } catch (err) {
        console.error("DEBUG ERROR:", err);
    } finally {
        process.exit(0);
    }
}
check();
