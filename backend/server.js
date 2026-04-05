require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const { testConnection, initDatabase } = require("./config/db_config");

const initDatabaseTables = require("./database/initDB");

const app = express();

//Config cho phép frontend gọi API
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    }),
);

//Config cho phép đọc cookie từ request
app.use(cookieParser()); // middleware đọc cookie

//config req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve static file (ảnh + pdf)
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

// Route
const authRoutes = require("./routes/auth.Routes");
const bookRoutes = require("./routes/bookRoutes");
const authorRoutes = require("./routes/authorRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const borrowRoutes = require("./routes/borrowRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const memberRoutes = require("./routes/memberRoutes");


//Use Route
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/borrows", borrowRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/members", memberRoutes);

// Error Handler
app.use((err, req, res, next) => {
    console.error("🔥 Global Error Handler:", err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Đã xảy ra lỗi hệ thống!",
        error: err.code || "INTERNAL_SERVER_ERROR",
        stack: err.stack, // Return stack to see it in browser
        details: err,
    });
});

// Start server
const PORT = process.env.PORT || 8080;
const startServer = async () => {
    try {
        // tạo db nêu chưa có + chọn db
        await initDatabase();

        // kiểm tra kết nối database
        await testConnection();

        // tạo bảng nếu chưa có
        await initDatabaseTables();

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🌐 http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Server failed to start:", error);
    }
};

startServer();
