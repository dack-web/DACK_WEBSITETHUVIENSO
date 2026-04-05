const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Đảm bảo thư mục upload tồn tại
const uploadDirs = ["uploads/images", "uploads/pdfs"];
uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Cấu hình storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === "cover_image") {
            cb(null, "uploads/images");
        } else if (file.fieldname === "pdf_file") {
            cb(null, "uploads/pdfs");
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Kiểm tra loại file
const fileFilter = (req, file, cb) => {
    if (file.fieldname === "cover_image") {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Chỉ cho phép tải lên hình ảnh!"), false);
        }
    } else if (file.fieldname === "pdf_file") {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Chỉ cho phép tải lên file PDF!"), false);
        }
    } else {
        cb(new Error("Trường file không hợp lệ!"), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // Giới hạn 10MB
    }
});

module.exports = upload;
