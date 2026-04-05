const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favoriteController");
const authMiddleware = require("../middlewares/auth/authMiddleware");

// Bảo vệ tất cả các route bằng authMiddleware
router.use(authMiddleware);

router.post("/toggle", favoriteController.toggleFavorite);
router.get("/", favoriteController.getFavorites);
router.get("/status/:bookId", favoriteController.checkStatus);

module.exports = router;
