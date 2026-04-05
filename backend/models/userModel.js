const { query } = require("../config/db_config");

exports.findUserByEmail = async (email) => {
    const rows = await query("SELECT * FROM users WHERE email=?", [email]);
    return rows[0];
};

exports.findUserById = async (id) => {
    const rows = await query("SELECT * FROM users WHERE id=?", [id]);
    return rows[0];
};

exports.createUser = async (name, email, hashedPassword) => {
    const result = await query("INSERT INTO users(name,email,password) VALUES(?,?,?)", [name, email, hashedPassword]);
    return result.insertId;
};

exports.updatePasswordByEmail = async (email, hashedPassword) => {
    await query("UPDATE users SET password=? WHERE email=?", [hashedPassword, email]);
};
