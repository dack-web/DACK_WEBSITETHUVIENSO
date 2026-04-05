const { query } = require("../config/db_config");

exports.createResetToken = async (email, token, expiresAt) => {
    await query("INSERT INTO password_resets(email,token,expires_at) VALUES(?,?,?)", [email, token, expiresAt]);
};

exports.findResetToken = async (token) => {
    const rows = await query("SELECT * FROM password_resets WHERE token=?", [token]);
    return rows[0];
};

exports.deleteResetToken = async (token) => {
    await query("DELETE FROM password_resets WHERE token=?", [token]);
};
