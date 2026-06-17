/**
 * 统计 + 健康检查
 * GET /api/v1/stats    统计数据
 * GET /api/v1/health   健康检查
 * POST /api/v1/feedback 用户反馈
 */

const express = require("express");
const router = express.Router();
const statsService = require("../services/stats.service");

router.get("/", (req, res) => {
  try {
    const stats = statsService.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error("[Stats Error]", error);
    res.status(500).json({
      success: false,
      error: { code: "STATS_ERROR", message: error.message },
    });
  }
});

router.get("/health", (req, res) => {
  try {
    const health = statsService.getHealth();
    res.json({ success: true, data: health });
  } catch (error) {
    console.error("[Health Error]", error);
    res.status(500).json({
      success: false,
      error: { code: "HEALTH_ERROR", message: error.message },
    });
  }
});

router.post("/feedback", (req, res) => {
  try {
    const result = statsService.submitFeedback(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.message === "MISSING_FIELDS") {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_FIELDS", message: "缺少反馈类型或内容" },
      });
    }
    console.error("[Feedback Error]", error);
    res.status(500).json({
      success: false,
      error: { code: "FEEDBACK_ERROR", message: error.message },
    });
  }
});

module.exports = router;
