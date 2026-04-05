const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth/authMiddleware");

const authController = require("../controllers/auth/auth.Controller");

const upload = require("../utils/upload");
const uploadAvatar = upload.single("avatar");

router.post("/register", authController.register);

router.post("/login", authController.login);

router.post("/refresh-token", authController.refreshToken);

router.post("/logout", authController.logout);

router.post("/forgot-password", authController.forgotPassword);

router.post("/reset-password", authController.resetPassword);

router.get("/profile", authMiddleware, authController.getProfile);

router.put("/profile", authMiddleware, authController.updateProfile);

router.post(
  "/avatar",
  authMiddleware,
  uploadAvatar,
  authController.uploadAvatar
);

module.exports = router;
