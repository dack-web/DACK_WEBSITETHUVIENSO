const Borrow = require("../models/borrowModel");

const borrowController = {
  // Chơi mượn sách
  borrowBook: async (req, res) => {
    try {
      const { user_id, book_id, borrow_days } = req.body;
      const isAdmin = req.user?.role === "admin";
      
      // Nếu là admin, có thể mượn hộ người khác bằng cách truyền user_id
      const finalUserId = (isAdmin && user_id) ? user_id : req.user?.id;

      if (!finalUserId) {
        return res.status(401).json({ success: false, message: "Yêu cầu đăng nhập hoặc ID người dùng" });
      }

      const result = await Borrow.borrowBook({
        userId: finalUserId,
        bookId: book_id,
        borrowDays: borrow_days || 14
      });

      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error("💥 borrowBook Error:", error);
      return res.status(error.status || 500).json({ success: false, message: error.message });
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
        isAdmin
      });

      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error("💥 returnBook Error:", error);
      return res.status(error.status || 500).json({ success: false, message: error.message });
    }
  },


};
