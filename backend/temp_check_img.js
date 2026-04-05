const { query } = require('./config/db_config');
async function check() {
    try {
        const books = await query('SELECT cover_image FROM books LIMIT 5');
        console.log('COVER IMAGES:', JSON.stringify(books, null, 2));
    } catch (e) {
        console.error(e);
    }
    process.exit();
}
check();
