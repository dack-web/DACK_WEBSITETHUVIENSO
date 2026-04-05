const { query } = require('./config/db_config');
async function check() {
    try {
        const users = await query('SELECT id, name, role FROM users');
        console.log('USERS:', JSON.stringify(users, null, 2));
    } catch (e) {
        console.error(e);
    }
    process.exit();
}
check();
