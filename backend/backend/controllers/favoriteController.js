const Favorite = require("../models/favoriteModel");

const favoriteController = {
  toggleFavorite: async (req, res) => {
    try {
      const { bookId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: "Yêu cầu đăng nhập" });
      }

      const isFavorite = await Favorite.checkFavoriteStatus(userId, bookId);

      if (isFavorite) {
        await Favorite.removeFavorite(userId, bookId);
        return res.status(200).json({ success: true, isFavorite: false, message: "Đã xóa khỏi danh sách yêu thích" });
      } else {
        await Favorite.addFavorite(userId, bookId);
        return res.status(200).json({ success: true, isFavorite: true, message: "Đã thêm vào danh sách yêu thích" });
      }
    } catch (error) {
      console.error("💥 toggleFavorite Error:", error);
      return res.status(error.status || 500).json({ success: false, message: error.message });
    }
  },

  getFavorites: async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Yêu cầu đăng nhập" });
      }

      const favorites = await Favorite.getFavoritesByUserId(userId);
      return res.status(200).json({ success: true, data: favorites });
    } catch (error) {
      console.error("💥 getFavorites Error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  checkStatus: async (req, res) => {
    try {
      const { bookId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(200).json({ success: true, isFavorite: false });
      }

      const isFavorite = await Favorite.checkFavoriteStatus(userId, bookId);
      return res.status(200).json({ success: true, isFavorite });
    } catch (error) {
      console.error("💥 checkStatus Error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = favoriteController;
