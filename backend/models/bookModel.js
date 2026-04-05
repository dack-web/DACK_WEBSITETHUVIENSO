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

    getById: async (id) => {
        const rows = await db.query(`
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

   
            WHERE b.id = ?
        `, [id]);
        return rows[0];
    },

    getByIsbn: async (isbn) => {
        const rows = await db.query(`
            SELECT b.*, a.name as author_name, c.name as category_name 
            FROM books b 
            LEFT JOIN authors a ON b.author_id = a.id 
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE b.isbn = ?
        `, [isbn]);
        return rows[0];
    },

    create: async (bookData) => {
        const { title, author_id, category_id, description, cover_image, pdf_file, published_year, isbn } = bookData;
        const result = await db.query(`
            INSERT INTO books (title, author_id, category_id, description, cover_image, pdf_file, published_year, isbn) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [title, author_id, category_id, description, cover_image, pdf_file, published_year, isbn]);
        return result.insertId;
    },

    
    update: async (id, bookData) => {
        const { title, author_id, category_id, description, cover_image, pdf_file, published_year, isbn } = bookData;
        await db.query(`
            UPDATE books 
            SET title = ?, author_id = ?, category_id = ?, description = ?, 
                cover_image = ?, pdf_file = ?, published_year = ?, isbn = ?
            WHERE id = ?
        `, [title, author_id, category_id, description, cover_image, pdf_file, published_year, isbn, id]);
    },

    delete: async (id) => {
        await db.query("DELETE FROM books WHERE id = ?", [id]);
    },

    searchBooks: async ({ query, category_id, author_id, sort, page = 1, limit = 10 }) => {
        let sql = `
            SELECT b.*, a.name as author_name, c.name as category_name 
            FROM books b 
            LEFT JOIN authors a ON b.author_id = a.id 
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE 1=1
        `;
        const params = [];

        if (query) {
            sql += " AND (b.title LIKE ? OR b.description LIKE ?)";
            params.push(`%${query}%`, `%${query}%`);
        }

        if (category_id) {
            sql += " AND b.category_id = ?";
            params.push(category_id);
        }

        if (author_id) {
            sql += " AND b.author_id = ?";
            params.push(author_id);
        }

        // Sorting
        switch (sort) {
            case "oldest":
                sql += " ORDER BY b.created_at ASC";
                break;
            case "title_az":
                sql += " ORDER BY b.title ASC";
                break;
            case "title_za":
                sql += " ORDER BY b.title DESC";
                break;
            case "newest":
            default:
                sql += " ORDER BY b.created_at DESC";
        }

        // Pagination
        const offset = (page - 1) * limit;
        sql += " LIMIT ? OFFSET ?";
        params.push(parseInt(limit), parseInt(offset));

        // Get total count for pagination
        let countSql = `SELECT COUNT(*) as total FROM books b WHERE 1=1`;
        const countParams = [];
        if (query) {
            countSql += " AND (b.title LIKE ? OR b.description LIKE ?)";
            countParams.push(`%${query}%`, `%${query}%`);
        }
        if (category_id) {
            countSql += " AND b.category_id = ?";
            countParams.push(category_id);
        }
        if (author_id) {
            countSql += " AND b.author_id = ?";
            countParams.push(author_id);
        }

        const rows = await db.query(sql, params);
        const [countResult] = await db.query(countSql, countParams);

        return {
            books: rows,
            pagination: {
                total: countResult.total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(countResult.total / limit)
            }
        };
    },

    getRecommendedBooks: async (excludeId, limit = 4) => {
        // Gợi ý sách cùng danh mục hoặc sách mới nhất
        let sql = `
            SELECT b.*, a.name as author_name 
            FROM books b
            LEFT JOIN authors a ON b.author_id = a.id
            WHERE b.id <> ?
            ORDER BY RAND()
            LIMIT ?
        `;
        const rows = await db.query(sql, [excludeId || 0, parseInt(limit)]);
        return rows;
    }
};

module.exports = Book;
