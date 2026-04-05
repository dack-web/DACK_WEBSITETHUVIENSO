const jwt = require("jsonwebtoken");

const whiteList = ["/login", "/register"];

module.exports = (req, res, next) => {
    // 1. Cho phép các route trong whiteList đi qua
    if (whiteList.includes(req.path)) {
        return next();
    }

    const authHeader = req.headers.authorization;

    // 2. Kiểm tra format header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.error("🚫 AuthMiddleware: Missing or malformed Authorization header");
        return res.status(401).json({
            success: false,
            message: "Authentication required (Missing token)",
        });
    }

    const token = authHeader.split(" ")[1];

    // Kiểm tra trường hợp token là chuỗi "null" hoặc "undefined" từ frontend
    if (token === "null" || token === "undefined" || !token) {
        console.error("🚫 AuthMiddleware: Token is null or empty");
        return res.status(401).json({
            success: false,
            message: "Token is missing or null. Please log in again.",
        });
    }

    try {
        const secret = process.env.JWT_SECRET || "supersecret";
        const decoded = jwt.verify(token, secret);

        // Lưu thông tin user vào request
        req.user = decoded;
        next();
    } catch (error) {
        console.error("❌ JWT Verify Error:", error.message);
        
        // Trả về 401 cho lỗi token hết hạn/không hợp lệ để frontend biết để refresh hoặc logout
        const isExpired = error.name === "TokenExpiredError";
        
        return res.status(401).json({
            success: false,
            message: isExpired ? "Token expired" : "Token invalid",
            code: isExpired ? "TOKEN_EXPIRED" : "TOKEN_INVALID"
        });
    }
};
