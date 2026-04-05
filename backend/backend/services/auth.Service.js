const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const userModel = require("../models/userModel");
const tokenModel = require("../models/refreshTokenModel");
const resetModel = require("../models/passwordResetModel");
const sendResetMail = require("../utils/node_mailer"); // bạn tự viết hoặc dùng nodemailer

// REGISTER
exports.register = async ({ fullName, email, password }) => {
    const user = await userModel.findUserByEmail(email);
    if (user) throw new Error("Email already exists");

    const hash = await bcrypt.hash(password, 10);
    const userId = await userModel.createUser(fullName, email, hash);

    return { id: userId, fullName, email };
};

// LOGIN
exports.login = async ({ email, password }) => {
    const user = await userModel.findUserByEmail(email.toLowerCase());

    if (!user) {
        const err = new Error("Invalid email");
        err.status = 401;
        throw err;
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        const err = new Error("Wrong password");
        err.status = 401;
        throw err;
    }

    const accessToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE || "15m" });

    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRE || "7d" });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await tokenModel.saveToken(user.id, refreshToken, expiresAt);

    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
        },
    };
};

// LOGOUT
exports.logout = async (refreshToken) => {
    await tokenModel.deleteToken(refreshToken);
};

// REFRESH TOKEN
exports.refreshToken = async (refreshToken) => {
    if (!refreshToken) {
        const err = new Error("No token provided");
        err.status = 401;
        throw err;
    }

    // Check token tồn tại trong DB
    const tokenRecord = await tokenModel.findToken(refreshToken);

    if (!tokenRecord) {
        const err = new Error("Invalid refresh token");
        err.status = 401;
        throw err;
    }

    let decoded;

    try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
        const error = new Error("Refresh token expired or invalid");
        error.status = 401;
        throw error;
    }

    const user = await userModel.findUserById(decoded.id);

    if (!user) {
        const err = new Error("User not found");
        err.status = 401;
        throw err;
    }

    const newAccessToken = jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRE || "15m",
        },
    );

    return {
        accessToken: newAccessToken,
    };
};

// FORGOT PASSWORD
exports.forgotPassword = async (email) => {
    const user = await userModel.findUserByEmail(email);
    if (!user) throw new Error("User not found");

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await resetModel.createResetToken(email, token, expiresAt);

    await sendResetMail(email, token); // bạn implement gửi mail ở utils/mailer.js
};

// RESET PASSWORD
exports.resetPassword = async (token, newPassword) => {
    const record = await resetModel.findResetToken(token);
    if (!record) throw new Error("Invalid token");

    if (new Date(record.expires_at) < new Date()) throw new Error("Token expired");

    const hash = await bcrypt.hash(newPassword, 10);

    await userModel.updatePasswordByEmail(record.email, hash);

    await resetModel.deleteResetToken(token);
};
