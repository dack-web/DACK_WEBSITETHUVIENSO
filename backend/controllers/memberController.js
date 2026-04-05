const db = require("../config/db_config");
const bcrypt = require("bcrypt");

// Lấy tất cả members
const getAllMembers = async (req, res) => {
    try {
        const members = await db.query(`
            SELECT id, name, email, avatar, phone, address, department, student_id, 
                   role, created_at 
            FROM users 
            WHERE role = 'user'
            ORDER BY created_at DESC
        `);
        
        res.json({ success: true, data: members });
    } catch (error) {
        console.error("Get members error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Lấy chi tiết member
const getMemberById = async (req, res) => {
    try {
        const { id } = req.params;
        const members = await db.query(`
            SELECT id, name, email, avatar, phone, address, department, student_id, 
                   role, created_at 
            FROM users 
            WHERE id = ? AND role = 'user'
        `, [id]);
        
        if (members.length === 0) {
            return res.status(404).json({ success: false, message: "Member not found" });
        }
        
        res.json({ success: true, data: members[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Thêm member mới
const addMember = async (req, res) => {
    try {
        const { name, email, password, phone, address, department, student_id } = req.body;
        
        // Kiểm tra email đã tồn tại
        const existing = await db.query("SELECT id FROM users WHERE email = ?", [email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: "Email already exists" });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await db.query(`
            INSERT INTO users (name, email, password, phone, address, department, student_id, role) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'user')
        `, [name, email, hashedPassword, phone || null, address || null, department || null, student_id || null]);
        
        res.json({ success: true, message: "Member added successfully", id: result.insertId });
    } catch (error) {
        console.error("Add member error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Cập nhật member
const updateMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, address, department, student_id } = req.body;
        
        await db.query(`
            UPDATE users 
            SET name = ?, email = ?, phone = ?, address = ?, department = ?, student_id = ? 
            WHERE id = ? AND role = 'user'
        `, [name, email, phone || null, address || null, department || null, student_id || null, id]);
        
        res.json({ success: true, message: "Member updated successfully" });
    } catch (error) {
        console.error("Update member error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Xóa member
const deleteMember = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM users WHERE id = ? AND role = 'user'", [id]);
        res.json({ success: true, message: "Member deleted successfully" });
    } catch (error) {
        console.error("Delete member error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAllMembers, getMemberById, addMember, updateMember, deleteMember };