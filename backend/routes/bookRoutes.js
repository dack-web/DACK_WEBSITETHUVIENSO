const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");
const upload = require("../utils/upload");

// Middleware upload cho Add và Update
const uploadMiddleware = upload.fields([
    { name: "cover_image", maxCount: 1 },
    { name: "pdf_file", maxCount: 1 }
]);

router.get("/", bookController.getAllBooks);

// Chức năng: Tìm kiếm sách theo tên - Mỹ Tâm
router.get('/search', bookController.searchBooks);

router.get("/:id", bookController.getBookById);

// Chức năng: Gợi ý sách liên quan - Mỹ Tâm
router.get("/:id/related", bookController.getRelatedBooks);

router.post("/", uploadMiddleware, bookController.addBook);
router.put("/:id", uploadMiddleware, bookController.updateBook);

router.delete("/:id", bookController.deleteBook);

module.exports = router;
