const db = require("../config/db_config");

const Category = {
    getAll: async () => {
        const rows = await db.query("SELECT * FROM categories ORDER BY name ASC");
        return rows;
    },

    getById: async (id) => {
        const rows = await db.query("SELECT * FROM categories WHERE id = ? LIMIT 1", [id]);
        return rows[0] || null;
    },

    create: async (name) => {
        const result = await db.query("INSERT INTO categories (name) VALUES (?)", [name]);
        return result.insertId;
    },

    update: async (id, name) => {
        const result = await db.query("UPDATE categories SET name = ? WHERE id = ?", [name, id]);
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const result = await db.query("DELETE FROM categories WHERE id = ?", [id]);
        return result.affectedRows > 0;
    }
};


module.exports = Category;
