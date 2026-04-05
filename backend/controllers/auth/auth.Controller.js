const authService = require("../../services/auth.Service");

exports.register = async (req, res, next) => {
    try {
        const user = await authService.register(req.body);
        res.json({ message: "Register success", user });
    } catch (err) {
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const tokens = await authService.login(req.body);
        res.json(tokens);
    } catch (err) {
        next(err);
    }
};

exports.logout = async (req, res, next) => {
    try {
        await authService.logout(req.body.refreshToken);
        res.json({ message: "Logged out" });
    } catch (err) {
        next(err);
    }
};

exports.refreshToken = async (req, res, next) => {
    try {
        const token = await authService.refreshToken(req.body.refreshToken);
        res.json(token);
    } catch (err) {
        next(err);
    }
};

exports.forgotPassword = async (req, res, next) => {
    try {
        await authService.forgotPassword(req.body.email);
        res.json({ message: "Reset mail sent" });
    } catch (err) {
        next(err);
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        await authService.resetPassword(req.body.token, req.body.password);
        res.json({ message: "Password reset success" });
    } catch (err) {
        next(err);
    }
};
