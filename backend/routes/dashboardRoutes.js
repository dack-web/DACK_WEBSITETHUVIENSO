const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const authMiddleware = require("../middlewares/auth/authMiddleware");

router.get("/overview", authMiddleware, dashboardController.getOverview);
router.get("/recent-activities", authMiddleware, dashboardController.getRecentActivities);
router.get("/weekly-activity", authMiddleware, dashboardController.getWeeklyActivity);

module.exports = router;