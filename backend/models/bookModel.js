const db = require("../config/db_config");

const Book = {
    getAll: async () => {
        let result = await db.query(`
            SELECT b.*, a.name as author_name, c.name as category_name 
            FROM books b 
            LEFT JOIN authors a ON b.author_id = a.id 
            LEFT JOIN categories c ON b.category_id = c.id
            ORDER BY b.created_at DESC
        `);
        const rows = Array.isArray(result[0]) ? result[0] : result;
        return rows;
    },

    // Chức năng: Tìm kiếm sách theo tên - Mỹ Tâm
    // Đã nâng cấp: Thêm Lọc, Sắp xếp và Phân trang
    searchByTitle: async (keyword, categoryId, authorId, sortBy, page = 1, limit = 5) => {
        const currentPage = Number(page) || 1;
        const perPage = Number(limit) || 5;

        let query = `
            SELECT b.*, a.name as author_name, c.name as category_name 
            FROM books b 
            LEFT JOIN authors a ON b.author_id = a.id 
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE b.title LIKE ?
        `;
        let countQuery = `
            SELECT COUNT(*) as total 
            FROM books b 
            WHERE b.title LIKE ?
        `;

        const params = [`%${keyword || ''}%`]; // Nếu không có keyword thì tìm tất cả
        const countParams = [`%${keyword || ''}%`];

        if (categoryId) {
            query += ` AND b.category_id = ?`;
            countQuery += ` AND b.category_id = ?`;
            params.push(categoryId);
            countParams.push(categoryId);
        }
        if (authorId) {
            query += ` AND b.author_id = ?`;
            countQuery += ` AND b.author_id = ?`;
            params.push(authorId);
            countParams.push(authorId);
        }

        // Xử lý chức năng sắp xếp (Mỹ Tâm)
        if (sortBy === 'az') {
            query += ` ORDER BY b.title ASC`; // Từ A đến Z
        } else if (sortBy === 'za') {
            query += ` ORDER BY b.title DESC`; // Từ Z về A
        } else if (sortBy === 'oldest') {
            query += ` ORDER BY b.published_year ASC`; // Cũ nhất (theo năm xuất bản)
        } else {
            query += ` ORDER BY b.created_at DESC`; // Mặc định: Mới nhất lên trước
        }

        // Xử lý chức năng phân trang (Mỹ Tâm)
        const offset = (currentPage - 1) * perPage;
        query += ` LIMIT ? OFFSET ?`;
        params.push(perPage, offset);

        // Fix lỗi cấu hình DB trả về mảng trực tiếp
        let result = await db.query(query, params);
        const rows = Array.isArray(result[0]) ? result[0] : result;
        
        // Đếm tổng số sách để tính tổng số trang
        let countResult = await db.query(countQuery, countParams);
        const countRows = Array.isArray(countResult[0]) ? countResult[0] : countResult;

        const totalBooks = countRows[0].total;
        const totalPages = Math.ceil(totalBooks / perPage);

        return {
            books: rows,
            totalBooks,
            totalPages,
            currentPage
        };
    },

    getById: async (id) => {
        let result = await db.query(`
            SELECT b.*, a.name as author_name, c.name as category_name 
            FROM books b 
            LEFT JOIN authors a ON b.author_id = a.id 
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE b.id = ?
        `, [id]);
        const rows = Array.isArray(result[0]) ? result[0] : result;
        return rows[0];
    },

    // Chức năng: Gợi ý sách liên quan (cùng thể loại) - Mỹ Tâm
    getRelatedBooks: async (bookId, limit = 5) => {
        let result = await db.query(`
            SELECT b.*, a.name as author_name, c.name as category_name 
            FROM books b 
            LEFT JOIN authors a ON b.author_id = a.id 
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE b.category_id = (SELECT category_id FROM books WHERE id = ?)
              AND b.id != ?
            ORDER BY b.created_at DESC
            LIMIT ?
        `, [bookId, bookId, Number(limit)]);
        const rows = Array.isArray(result[0]) ? result[0] : result;
        return rows;
    },

    create: async (bookData) => {
        const { title, author_id, category_id, description, cover_image, pdf_file, published_year } = bookData;
        let queryResult = await db.query(`
            INSERT INTO books (title, author_id, category_id, description, cover_image, pdf_file, published_year) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [title, author_id, category_id, description, cover_image, pdf_file, published_year]);
        const result = Array.isArray(queryResult) ? queryResult[0] : queryResult;
        return result.insertId;
    },

    update: async (id, bookData) => {
        const { title, author_id, category_id, description, cover_image, pdf_file, published_year } = bookData;
        await db.query(`
            UPDATE books 
            SET title = ?, author_id = ?, category_id = ?, description = ?, 
                cover_image = ?, pdf_file = ?, published_year = ? 
            WHERE id = ?
        `, [title, author_id, category_id, description, cover_image, pdf_file, published_year, id]);
    },

    delete: async (id) => {
        await db.query("DELETE FROM books WHERE id = ?", [id]);
    }
};

module.exports = Book;
