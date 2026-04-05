const db = require("../config/db_config");

const Author = {
    getAll: async () => {
        const [rows] = await db.query("SELECT * FROM authors ORDER BY name ASC");
        return rows;
    },

    create: async (name) => {
        const [result] = await db.query("INSERT INTO authors (name) VALUES (?)", [name]);
        return result.insertId;
    }
};

module.exports = Author;
