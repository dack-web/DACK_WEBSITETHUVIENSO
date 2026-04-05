const db = require("../config/db_config");

const initDatabaseTables = async () => {
    try {
        /*
      USERS
      Bảng lưu thông tin người dùng của hệ thống
    */
        await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY, -- id tự tăng
        name VARCHAR(100) NOT NULL, -- tên người dùng
        email VARCHAR(100) UNIQUE NOT NULL, -- email duy nhất
        password VARCHAR(255) NOT NULL, -- mật khẩu đã mã hóa
        avatar VARCHAR(255), -- ảnh đại diện
        role ENUM('user','admin') DEFAULT 'user', -- quyền
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- ngày tạo
      )
    `);

        /*
      AUTHORS
      Bảng lưu thông tin tác giả
    */
        await db.query(`
      CREATE TABLE IF NOT EXISTS authors (
        id INT AUTO_INCREMENT PRIMARY KEY, -- id tác giả
        name VARCHAR(150) NOT NULL -- tên tác giả
      )
    `);

        /*
      CATEGORIES
      Bảng lưu thể loại sách
    */
        await db.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY, -- id thể loại
        name VARCHAR(150) NOT NULL -- tên thể loại
      )
    `);

        /*
      BOOKS
      Bảng lưu thông tin sách
    */
        await db.query(`
      CREATE TABLE IF NOT EXISTS books (
        id INT AUTO_INCREMENT PRIMARY KEY, -- id sách
        title VARCHAR(255) NOT NULL, -- tiêu đề sách
        author_id INT, -- id tác giả
        category_id INT, -- id thể loại
        description TEXT, -- mô tả sách
        cover_image VARCHAR(255), -- ảnh bìa
        pdf_file VARCHAR(255), -- file pdf
        published_year INT, -- năm xuất bản
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- ngày tạo

        FOREIGN KEY (author_id)
          REFERENCES authors(id)
          ON DELETE SET NULL,

        FOREIGN KEY (category_id)
          REFERENCES categories(id)
          ON DELETE SET NULL
      )
    `);

        /*
      BORROWS
      Bảng lưu thông tin mượn sách
    */
        await db.query(`
      CREATE TABLE IF NOT EXISTS borrows (
        id INT AUTO_INCREMENT PRIMARY KEY, -- id mượn sách
        user_id INT NOT NULL, -- người mượn
        book_id INT NOT NULL, -- sách mượn
        borrow_date DATE, -- ngày mượn
        due_date DATE, -- hạn trả
        return_date DATE, -- ngày trả

        status ENUM('borrowed','returned','late') DEFAULT 'borrowed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE,

        FOREIGN KEY (book_id)
          REFERENCES books(id)
          ON DELETE CASCADE
      )
    `);

        /*
      RESERVATIONS
      Bảng lưu thông tin đặt trước sách
    */
        await db.query(`
      CREATE TABLE IF NOT EXISTS reservations (
        id INT AUTO_INCREMENT PRIMARY KEY, -- id đặt trước
        user_id INT,
        book_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE,

        FOREIGN KEY (book_id)
          REFERENCES books(id)
          ON DELETE CASCADE
      )
    `);

        /*
      REVIEWS
      Bảng lưu đánh giá và bình luận sách
    */
        await db.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY, -- id đánh giá
        user_id INT,
        book_id INT,
        rating INT CHECK (rating BETWEEN 1 AND 5), -- số sao
        comment TEXT, -- nội dung bình luận
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE,

        FOREIGN KEY (book_id)
          REFERENCES books(id)
          ON DELETE CASCADE
      )
    `);

        /*
      READING HISTORY
      Bảng lưu lịch sử đọc sách
    */
        await db.query(`
      CREATE TABLE IF NOT EXISTS reading_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        book_id INT,
        last_page INT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (book_id) REFERENCES books(id)
      )
    `);

        /*
      REFRESH TOKENS
      Bảng lưu refresh token để cấp lại access token
    */
        await db.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(500) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE
      )
    `);

        /*
      PASSWORD RESETS
      Bảng lưu token reset mật khẩu
    */
        await db.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100),
        token VARCHAR(255),
        expires_at DATETIME
      )
    `);

        console.log("✅ All tables created successfully");
    } catch (error) {
        console.error("❌ Database init error:", error);
    }
};

module.exports = initDatabaseTables;
