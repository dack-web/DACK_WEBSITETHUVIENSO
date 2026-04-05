const db = require("../config/db_config");

const createError = (message, status = 400) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

const Borrow = {
    // Hàm này giúp lấy book_id từ ID hoặc ISBN một cách đồng nhất
    // Nó nhận vào bất kỳ object nào có phương thức .query() (có thể là db helper hoặc connection pool)
    resolveBookId: async (queryable, identifier) => {
        if (!identifier) return null;

        // Helper query trả về rows trực tiếp, native trả về [rows, fields]
        // Chúng ta sẽ kiểm tra xem kết quả có phải là mảng lồng mảng không
        const execute = async (sq, pa) => {
            const result = await queryable.query(sq, pa);
            // Nếu result[0] là mảng, nghĩa là đây là native mysql2 return [rows, fields]
            if (Array.isArray(result) && Array.isArray(result[0])) return result[0];
            // Nếu không, đây là db.query helper trả về rows trực tiếp
            return result;
        };

        // 1. Thử tìm theo ID (nếu là số)
        if (!isNaN(identifier) && Number.isInteger(Number(identifier))) {
            const rows = await execute("SELECT id FROM books WHERE id = ?", [identifier]);
            if (rows && rows.length) return rows[0].id;
        }

        // 2. Thử tìm theo ISBN
        const rows = await execute("SELECT id FROM books WHERE isbn = ?", [identifier]);
        if (rows && rows.length) return rows[0].id;

        return null;
    },

    // Muốn sách: tạo phiếu mượn nếu sách chưa có ai giữ và không vi phạm hàng đợi đặt trước
    borrowBook: async ({ userId, bookId: bookIdentifier, borrowDays = 14 }) => {
        return db.transaction(async (connection) => {
            const bookId = await Borrow.resolveBookId(connection, bookIdentifier);
            if (!bookId) {
                throw createError("Không tìm thấy sách với ID hoặc ISBN này", 404);
            }

            // Check xem sách có đang được mượn không
            const [activeBorrowRows] = await connection.query(`SELECT id FROM borrows WHERE book_id = ? AND return_date IS NULL LIMIT 1 FOR UPDATE`, [bookId]);

            if (activeBorrowRows.length) {
                throw createError("Sách hiện đang được mượn bởi người khác", 400);
            }

            // Check hàng đợi đặt trước
            const [firstReservationRows] = await connection.query(`SELECT id, user_id FROM reservations WHERE book_id = ? ORDER BY created_at ASC LIMIT 1 FOR UPDATE`, [bookId]);

            if (firstReservationRows.length && firstReservationRows[0].user_id !== userId) {
                throw createError("Sách đang được ưu tiên đặt trước bởi người dùng khác", 409);
            }

            // Tạo phiếu mượn
            const [result] = await connection.query(
                `INSERT INTO borrows (user_id, book_id, borrow_date, due_date, status)
         VALUES (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL ? DAY), 'borrowed')`,
                [userId, bookId, borrowDays],
            );

            // Nếu người mượn là người đang đặt trước đầu tiên -> xóa phiếu đặt trước
            if (firstReservationRows.length && firstReservationRows[0].user_id === userId) {
                await connection.query("DELETE FROM reservations WHERE id = ?", [firstReservationRows[0].id]);
            }

            return {
                borrowId: result.insertId,
                bookId,
                dueInDays: borrowDays,
            };
        });
    },

    // Trả sách
    returnBook: async ({ borrowId, userId, isAdmin = false }) => {
        return db.transaction(async (connection) => {
            const [borrowRows] = await connection.query(
                `SELECT b.id, b.user_id, b.book_id, b.due_date, b.return_date, bk.title
         FROM borrows b
         JOIN books bk ON bk.id = b.book_id
         WHERE b.id = ?
         LIMIT 1
         FOR UPDATE`,
                [borrowId],
            );

            if (!borrowRows.length) {
                throw createError("Không tìm thấy phiếu mượn", 404);
            }

            const borrow = borrowRows[0];

            if (!isAdmin && borrow.user_id !== userId) {
                throw createError("Bạn không có quyền trả phiếu mượn này", 403);
            }

            if (borrow.return_date) {
                throw createError("Sách đã được trả trước đó", 400);
            }

            await connection.query(
                `UPDATE borrows
         SET return_date = CURDATE(),
             status = CASE WHEN due_date < CURDATE() THEN 'late' ELSE 'returned' END
         WHERE id = ?`,
                [borrowId],
            );

            return {
                borrowId,
                bookId: borrow.book_id,
            };
        });
    },

    // Gia hạn
    extendBorrow: async ({ borrowId, userId, extraDays = 7, isAdmin = false }) => {
        return db.transaction(async (connection) => {
            const [borrowRows] = await connection.query(`SELECT id, user_id, book_id, due_date, return_date FROM borrows WHERE id = ? LIMIT 1 FOR UPDATE`, [borrowId]);

            if (!borrowRows.length) throw createError("Không tìm thấy phiếu mượn", 404);

            const borrow = borrowRows[0];
            if (!isAdmin && borrow.user_id !== userId) throw createError("Quyền truy cập bị từ chối", 403);
            if (borrow.return_date) throw createError("Sách đã được trả", 400);

            const [reservationRows] = await connection.query(`SELECT COUNT(*) AS total FROM reservations WHERE book_id = ? AND user_id <> ?`, [borrow.book_id, borrow.user_id]);

            if (reservationRows[0].total > 0) throw createError("Có người khác đang đặt trước sách này", 409);

            await connection.query("UPDATE borrows SET due_date = DATE_ADD(due_date, INTERVAL ? DAY) WHERE id = ?", [extraDays, borrowId]);

            return { borrowId, extendedDays: extraDays };
        });
    },

    // Đặt trước
    reserveBook: async ({ userId, bookId: bookIdentifier }) => {
        return db.transaction(async (connection) => {
            const bookId = await Borrow.resolveBookId(connection, bookIdentifier);
            if (!bookId) throw createError("Sách không tồn tại", 404);

            const [activeBorrowRows] = await connection.query(`SELECT id FROM borrows WHERE book_id = ? AND return_date IS NULL LIMIT 1 FOR UPDATE`, [bookId]);

            if (!activeBorrowRows.length) throw createError("Sách đang sẵn sàng, hãy mượn trực tiếp", 400);

            const [result] = await connection.query("INSERT INTO reservations (user_id, book_id) VALUES (?, ?)", [userId, bookId]);

            return { reservationId: result.insertId, bookId };
        });
    },

    // Lịch sử mượn
    getBorrowHistory: async ({ userId, isAdmin = false, targetUserId = null }) => {
        console.log("📊 Model getBorrowHistory params:", { userId, isAdmin, targetUserId });
        let whereSql = "WHERE 1=1";
        const params = [];

        if (!isAdmin) {
            whereSql += " AND b.user_id = ?";
            params.push(userId);
        } else if (targetUserId) {
            whereSql += " AND b.user_id = ?";
            params.push(targetUserId);
        }

        // Luôn sử dụng db.query (helper) cho các lệnh SELECT đơn giản
        const rows = await db.query(
            `SELECT b.id, b.user_id, u.name AS user_name, u.email,
              b.book_id, bk.title AS book_title, bk.cover_image, bk.pdf_file,
              b.borrow_date, b.due_date, b.return_date, b.status,
              b.created_at
       FROM borrows b
       JOIN users u ON u.id = b.user_id
       JOIN books bk ON bk.id = b.book_id
       ${whereSql}
       ORDER BY b.created_at DESC
       LIMIT 50`,
            params,
        );

        console.log("📊 Fetched", rows.length, "borrow records");
        return rows;
    },

    // Trạng thái sách
    getBookStatus: async (bookIdentifier) => {
        const bookId = await Borrow.resolveBookId(db, bookIdentifier);
        if (!bookId) throw createError("Sách không tồn tại", 404);

        const [book] = await db.query("SELECT * FROM books WHERE id = ?", [bookId]);
        const [activeBorrow] = await db.query(
            `SELECT b.*, u.name as borrower_name FROM borrows b 
       JOIN users u ON u.id = b.user_id 
       WHERE book_id = ? AND return_date IS NULL LIMIT 1`,
            [bookId],
        );

        return {
            book,
            status: activeBorrow ? (new Date(activeBorrow.due_date) < new Date() ? "late" : "borrowed") : "available",
            activeBorrow,
        };
    },

    // Cập nhật trạng thái quá hạn cho các phiếu chưa trả
    updateOverdueStatuses: async ({ userId = null, isAdmin = false } = {}) => {
        let sql = `
            UPDATE borrows
            SET status = 'late'
            WHERE return_date IS NULL
              AND due_date < CURDATE()
              AND status <> 'late'
        `;
        const params = [];

        if (!isAdmin) {
            sql += " AND user_id = ?";
            params.push(userId);
        }

        const result = await db.query(sql, params);
        return result.affectedRows || 0;
    },

    // Lấy danh sách các phiếu quá hạn
    getOverdueBorrows: async ({ userId = null, isAdmin = false } = {}) => {
        let sql = `
            SELECT
                b.id,
                b.user_id,
                u.name AS user_name,
                b.book_id,
                bk.title AS book_title,
                b.borrow_date,
                b.due_date,
                b.status,
                DATEDIFF(CURDATE(), b.due_date) AS overdue_days
            FROM borrows b
            JOIN users u ON u.id = b.user_id
            JOIN books bk ON bk.id = b.book_id
            WHERE b.return_date IS NULL
              AND (b.status = 'late' OR b.due_date < CURDATE())
        `;
        const params = [];

        if (!isAdmin) {
            sql += " AND b.user_id = ?";
            params.push(userId);
        }

        sql += " ORDER BY b.due_date ASC";

        return db.query(sql, params);
    },
};

module.exports = Borrow;
