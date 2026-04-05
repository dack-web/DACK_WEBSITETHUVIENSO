const Book = require("../models/bookModel");
const fs = require("fs");
const path = require("path");

const bookController = {
    // Lấy tất cả sách
    getAllBooks: async (req, res) => {
        try {
            const books = await Book.getAll();
            res.status(200).json({ success: true, data: books });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Tìm kiếm sách theo tên
    // Chức năng: Tìm kiếm sách theo tên - Mỹ Tâm
    searchBooks: async (req, res) => {
        try {
            // Lấy các tham số từ query URL
            const { title, category_id, author_id, sort_by, page, limit } = req.query; 

            // Gọi hàm tìm kiếm và truyền thêm bộ lọc, sắp xếp, phân trang (Mỹ Tâm)
            const result = await Book.searchByTitle(title, category_id, author_id, sort_by, page, limit);
            
            res.status(200).json({ 
                success: true, 
                data: result.books,
                pagination: {
                    totalBooks: result.totalBooks,
                    totalPages: result.totalPages,
                    currentPage: result.currentPage
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Lấy chi tiết 1 cuốn sách
    getBookById: async (req, res) => {
        try {
            const book = await Book.getById(req.params.id);
            if (!book) {
                return res.status(404).json({ success: false, message: "Không tìm thấy sách" });
            }
            res.status(200).json({ success: true, data: book });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Chức năng: Gợi ý sách liên quan - Mỹ Tâm
    getRelatedBooks: async (req, res) => {
        try {
            const bookId = req.params.id;
            const limit = req.query.limit || 5; // Mặc định lấy 5 cuốn gợi ý
            
            const relatedBooks = await Book.getRelatedBooks(bookId, limit);
            res.status(200).json({ success: true, data: relatedBooks });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Thêm sách mới
    addBook: async (req, res) => {
        try {
            const { title, author_id, category_id, description, published_year } = req.body;
            
            // Xử lý file upload
            const cover_image = req.files && req.files.cover_image 
                ? `/uploads/images/${req.files.cover_image[0].filename}` 
                : null;
            const pdf_file = req.files && req.files.pdf_file 
                ? `/uploads/pdfs/${req.files.pdf_file[0].filename}` 
                : null;

            const bookId = await Book.create({
                title,
                author_id,
                category_id,
                description,
                cover_image,
                pdf_file,
                published_year: published_year || null
            });

            res.status(201).json({
                success: true,
                message: "Thêm sách thành công!",
                bookId: bookId
            });
        } catch (error) {
            // Xóa file nếu insert DB lỗi
            if (req.files) {
                if (req.files.cover_image) fs.unlinkSync(req.files.cover_image[0].path);
                if (req.files.pdf_file) fs.unlinkSync(req.files.pdf_file[0].path);
            }
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Cập nhật sách
    updateBook: async (req, res) => {
        try {
            const bookId = req.params.id;
            const oldBook = await Book.getById(bookId);
            if (!oldBook) {
                return res.status(404).json({ success: false, message: "Không tìm thấy sách" });
            }

            const { title, author_id, category_id, description, published_year } = req.body;
            
            // Xử lý file upload mới
            let cover_image = oldBook.cover_image;
            let pdf_file = oldBook.pdf_file;

            if (req.files) {
                if (req.files.cover_image) {
                    // Xóa ảnh cũ
                    if (oldBook.cover_image) {
                        const oldPath = path.join(__dirname, "../../", oldBook.cover_image);
                        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                    }
                    cover_image = `/uploads/images/${req.files.cover_image[0].filename}`;
                }
                if (req.files.pdf_file) {
                    // Xóa file pdf cũ
                    if (oldBook.pdf_file) {
                        const oldPath = path.join(__dirname, "../../", oldBook.pdf_file);
                        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                    }
                    pdf_file = `/uploads/pdfs/${req.files.pdf_file[0].filename}`;
                }
            }

            await Book.update(bookId, {
                title,
                author_id,
                category_id,
                description,
                cover_image,
                pdf_file,
                published_year: published_year || null
            });

            res.status(200).json({ success: true, message: "Cập nhật sách thành công!" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Xóa sách
    deleteBook: async (req, res) => {
        try {
            const book = await Book.getById(req.params.id);
            if (!book) {
                return res.status(404).json({ success: false, message: "Không tìm thấy sách" });
            }

            // Xóa các file đính kèm
            if (book.cover_image) {
                const imgPath = path.join(__dirname, "../../", book.cover_image);
                if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
            }
            if (book.pdf_file) {
                const pdfPath = path.join(__dirname, "../../", book.pdf_file);
                if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
            }

            await Book.delete(req.params.id);
            res.status(200).json({ success: true, message: "Xóa sách thành công!" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = bookController;
