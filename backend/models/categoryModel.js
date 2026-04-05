const db = require("../config/db_config");

const Category = {
    getAll: async () => {
        const [rows] = await db.query("SELECT * FROM categories ORDER BY name ASC");
        return rows;
    },

    create: async (name) => {
        const [result] = await db.query("INSERT INTO categories (name) VALUES (?)", [name]);
        return result.insertId;
    }
};

module.exports = Category;
