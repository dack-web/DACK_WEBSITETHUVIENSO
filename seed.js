const db = require("./backend/config/db_config");

const seedData = async () => {
    try {
        console.log("🌱 Seeding data...");
        
        // Authors
        await db.query("INSERT IGNORE INTO authors (id, name) VALUES (1, 'Friedrich Nietzsche'), (2, 'Franz Kafka'), (3, 'Fyodor Dostoevsky')");
        
        // Categories
        await db.query("INSERT IGNORE INTO categories (id, name) VALUES (1, 'Philosophy'), (2, 'Literature'), (3, 'Psychology')");
        
        // Books
        await db.query(`
            INSERT IGNORE INTO books (id, title, author_id, category_id, published_year, description) VALUES 
            (1, 'The Birth of Tragedy', 1, 1, 1872, 'A work of dramatic theory by the German philosopher Friedrich Nietzsche.'),
            (2, 'The Metamorphosis', 2, 2, 1915, 'A novella written by Franz Kafka which was first published in 1915.'),
            (3, 'Crime and Punishment', 3, 2, 1866, 'A novel by the Russian author Fyodor Dostoevsky.')
        `);
        
        console.log("✅ Seeding complete!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding error:", error);
        process.exit(1);
    }
};

seedData();
