const authService = require("../../services/auth.Service.js");
const fs = require("fs");
const path = require("path");
const { query } = require("../../config/db_config.js");

exports.register = async (req, res) => {
    try {
        const user = await authService.register(req.body);

        res.status(200).json({
            message: "Register success",
            user,
        });
    } catch (err) {
        res.status(err.status || 500).json({
            message: err.message || "Server error",
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { accessToken, refreshToken, user } = await authService.login(req.body);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            accessToken,
            user,
            message: "Login success",
        });
    } catch (err) {
        res.status(err.status || 401).json({
            message: err.message || "Login failed",
        });
    }
};

exports.logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            await authService.logout(refreshToken);
        }

        res.clearCookie("refreshToken");

        res.status(200).json({
            message: "Logged out",
        });
    } catch (err) {
        res.status(err.status || 500).json({
            message: err.message,
        });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const token = await authService.refreshToken(req.cookies.refreshToken);

        res.status(200).json(token);
    } catch (err) {
        res.status(err.status || 401).json({
            message: err.message || "Invalid refresh token",
        });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        await authService.forgotPassword(req.body.email);

        res.status(200).json({
            message: "Reset mail sent",
        });
    } catch (err) {
        res.status(err.status || 400).json({
            message: err.message,
        });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        await authService.resetPassword(req.body.token, req.body.new_password);

        res.status(200).json({
            message: "Password reset success",
        });
    } catch (err) {
        res.status(err.status || 400).json({
            message: err.message,
        });
    }
};

// Get Profile - dùng cột 'name'
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const users = await query("SELECT id, name, email, phone, address, department, student_id, role, avatar, created_at FROM users WHERE id = ?", [userId]);

        if (!users || users.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Thêm alias full_name cho frontend
        const userData = users[0];
        userData.full_name = userData.name;

        res.json({ success: true, data: userData });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Cập nhật thông tin profile
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { full_name, phone, address, department, student_id } = req.body;

        await query(
            `UPDATE users 
         SET name = ?, phone = ?, address = ?, 
             department = ?, student_id = ? 
         WHERE id = ?`,
            [full_name || null, phone || null, address || null, department || null, student_id || null, userId],
        );

        const users = await query("SELECT id, name, email, phone, address, department, student_id, role, avatar, created_at FROM users WHERE id = ?", [userId]);

        const userData = users[0];
        userData.full_name = userData.name;

        res.json({
            success: true,
            message: "Profile updated successfully",
            data: userData,
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Upload Avatar - THÊM MỚI
exports.uploadAvatar = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        // Đường dẫn avatar mới (Multer đã lưu file theo userId)
        const avatarPath = `/uploads/avatars/${req.file.filename}`;

        // Lấy avatar cũ từ database
        const [oldUser] = await query("SELECT avatar FROM users WHERE id = ?", [userId]);
        const oldAvatar = oldUser?.avatar;

        // Xóa avatar cũ nếu tồn tại và khác file mới
        if (oldAvatar && oldAvatar !== avatarPath) {
            const oldPath = path.join(__dirname, "../../../", oldAvatar);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        // Cập nhật avatar mới vào database
        await query("UPDATE users SET avatar = ? WHERE id = ?", [avatarPath, userId]);

        res.json({
            success: true,
            message: "Avatar updated successfully",
            avatar: avatarPath,
        });
    } catch (error) {
        console.error("Upload avatar error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
