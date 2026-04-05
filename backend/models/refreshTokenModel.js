const { query } = require("../config/db_config");

exports.saveToken = async (userId, token, expiresAt) => {
    await query("INSERT INTO refresh_tokens(user_id,token,expires_at) VALUES(?,?,?)", [userId, token, expiresAt]);
};

exports.findToken = async (token) => {
    const rows = await query("SELECT * FROM refresh_tokens WHERE token=?", [token]);
    return rows[0];
};

exports.deleteToken = async (token) => {
    await query("DELETE FROM refresh_tokens WHERE token=?", [token]);
};
