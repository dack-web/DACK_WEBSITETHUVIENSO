const express = require("express");
const router = express.Router();
const borrowController = require("../controllers/borrowController");
const authMiddleware = require("../middlewares/auth/authMiddleware");

// Bảo vệ tất cả các route bằng authMiddleware
router.use(authMiddleware);

// Các route này đều yêu cầu đăng nhập (đã được bọc bởi authMiddleware ở server.js hoặc tại đây)
router.post("/borrow", borrowController.borrowBook);
router.post("/return/:borrowId", borrowController.returnBook);
router.post("/extend/:borrowId", borrowController.extendBorrow);
router.post("/reserve", borrowController.reserveBook);
router.get("/history", borrowController.getBorrowHistory);
router.get("/status/:bookId", borrowController.getBookStatus);
router.get("/overdue", borrowController.checkOverdue);
router.post("/seed-history", borrowController.seedHistory);

module.exports = router;
