const { query } = require('./config/db_config');
async function checkBooks() {
    try {
        const books = await query('SELECT title, cover_image FROM books LIMIT 5');
        console.log('BOOKS:', JSON.stringify(books, null, 2));
    } catch (e) {
        console.error(e);
    }
    process.exit();
}
checkBooks();
