const db = require("../config/db_config");

const createError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const Favorite = {
  addFavorite: async (userId, bookId) => {
    try {
      const result = await db.query(
        "INSERT INTO favorites (user_id, book_id) VALUES (?, ?)",
        [userId, bookId]
      );
      return { id: result.insertId, user_id: userId, book_id: bookId };
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        throw createError("Sách đã có trong danh sách yêu thích", 400);
      }
      throw error;
    }
  },

  removeFavorite: async (userId, bookId) => {
    const result = await db.query(
      "DELETE FROM favorites WHERE user_id = ? AND book_id = ?",
      [userId, bookId]
    );
    if (result.affectedRows === 0) {
      throw createError("Sách chưa có trong danh sách yêu thích", 404);
    }
    return { success: true };
  },

  getFavoritesByUserId: async (userId) => {
    const rows = await db.query(
      `SELECT f.*, b.title, b.author_id, b.cover_image, a.name as author_name 
       FROM favorites f
       JOIN books b ON f.book_id = b.id
       JOIN authors a ON b.author_id = a.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [userId]
    );
    return rows;
  },

  checkFavoriteStatus: async (userId, bookId) => {
    const rows = await db.query(
      "SELECT id FROM favorites WHERE user_id = ? AND book_id = ?",
      [userId, bookId]
    );
    return rows.length > 0;
  }
};

module.exports = Favorite;
