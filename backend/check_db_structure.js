require('dotenv').config();
const { query } = require('./config/db_config');
const fs = require('fs');

async function run() {
    try {
        const cols = await query('DESCRIBE books');
        fs.writeFileSync('db_debug.json', JSON.stringify(cols, null, 2));
        console.log("✅ DB Structure saved to db_debug.json");
    } catch (e) {
        fs.writeFileSync('db_debug.json', JSON.stringify({ error: e.message, stack: e.stack }, null, 2));
    } finally {
        process.exit();
    }
}
run();
