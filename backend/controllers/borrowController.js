const Borrow = require("../models/borrowModel");

const borrowController = {
  // Chơi mượn sách
  borrowBook: async (req, res) => {
    try {
      const { user_id, book_id, borrow_days } = req.body;
      const isAdmin = req.user?.role === "admin";

      // Nếu là admin, có thể mượn hộ người khác bằng cách truyền user_id
      const finalUserId = isAdmin && user_id ? user_id : req.user?.id;

      if (!finalUserId) {
        return res
          .status(401)
          .json({
            success: false,
            message: "Yêu cầu đăng nhập hoặc ID người dùng",
          });
      }

      const result = await Borrow.borrowBook({
        userId: finalUserId,
        bookId: book_id,
        borrowDays: borrow_days || 14,
      });

      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error("💥 borrowBook Error:", error);
      return res
        .status(error.status || 500)
        .json({ success: false, message: error.message });
    }
  },
  // Trả sách
  returnBook: async (req, res) => {
    try {
      const { borrowId } = req.params;
      const isAdmin = req.user?.role === "admin";
      const userId = req.user?.id;

      const result = await Borrow.returnBook({
        borrowId,
        userId,
        isAdmin,
      });

      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error("💥 returnBook Error:", error);
      return res
        .status(error.status || 500)
        .json({ success: false, message: error.message });
    }
  },

  // Gia hạn
  extendBorrow: async (req, res) => {
    try {
      const { borrowId } = req.params;
      const { extra_days } = req.body;
      const isAdmin = req.user?.role === "admin";
      const userId = req.user?.id;

      const result = await Borrow.extendBorrow({
        borrowId,
        userId,
        extraDays: extra_days || 7,
        isAdmin,
      });

      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error("💥 extendBorrow Error:", error);
      return res
        .status(error.status || 500)
        .json({ success: false, message: error.message });
    }
  },

  // Đặt trước
  reserveBook: async (req, res) => {
    try {
      const { book_id } = req.body;
      const userId = req.user?.id;

      if (!userId)
        return res
          .status(401)
          .json({ success: false, message: "Phải đăng nhập" });

      const result = await Borrow.reserveBook({
        userId,
        bookId: book_id,
      });

      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error("💥 reserveBook Error:", error);
      return res
        .status(error.status || 500)
        .json({ success: false, message: error.message });
    }
  },

  // Lịch sử mượn
  getBorrowHistory: async (req, res) => {
    console.log(
      "🔍 Fetching history for user:",
      req.user?.id,
      "Role:",
      req.user?.role,
    );
    try {
      const userId = req.user?.id;
      const isAdmin = req.user?.role === "admin";
      const targetUserId = req.query.user_id ? Number(req.query.user_id) : null;

      if (!userId && !isAdmin) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized", data: [] });
      }

      const history = await Borrow.getBorrowHistory({
        userId,
        isAdmin,
        targetUserId,
      });

      return res.status(200).json({ success: true, data: history });
    } catch (error) {
      console.error("💥 history ERROR:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi tải lịch sử: " + error.message,
        data: [],
      });
    }
  },

  // Lịch sử mượn
  getBorrowHistory: async (req, res) => {
    console.log(
      "🔍 Fetching history for user:",
      req.user?.id,
      "Role:",
      req.user?.role,
    );
    try {
      const userId = req.user?.id;
      const isAdmin = req.user?.role === "admin";
      const targetUserId = req.query.user_id ? Number(req.query.user_id) : null;

      if (!userId && !isAdmin) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized", data: [] });
      }

      const history = await Borrow.getBorrowHistory({
        userId,
        isAdmin,
        targetUserId,
      });

      return res.status(200).json({ success: true, data: history });
    } catch (error) {
      console.error("💥 history ERROR:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi tải lịch sử: " + error.message,
        data: [],
      });
    }
  },

  // Trạng thái sách
  getBookStatus: async (req, res) => {
    try {
      const { bookId } = req.params;
      const status = await Borrow.getBookStatus(bookId);
      return res.status(200).json({ success: true, data: status });
    } catch (error) {
      return res
        .status(error.status || 500)
        .json({ success: false, message: error.message });
    }
  },

  // Kiểm tra quá hạn
  checkOverdue: async (req, res) => {
    try {
      const userId = req.user?.id;
      const isAdmin = req.user?.role === "admin";

      const overdueRows = await Borrow.getOverdueBorrows({ userId, isAdmin });
      return res.status(200).json({
        success: true,
        total: overdueRows.length,
        data: overdueRows,
      });
    } catch (error) {
      return res
        .status(error.status || 500)
        .json({ success: false, message: error.message });
    }
  },

  seedHistory: async (req, res) => {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin only" });
    }
    try {
      const { seedCirculationData } = require("../database/seedCirculation");
      const result = await seedCirculationData();
      return res.status(201).json(result);
    } catch (error) {
      console.error("💥 Seed ERROR:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};
module.exports = borrowController;
