/**
 * 概念对比路由
 * GET    /api/v1/comparisons           全部对比
 * POST   /api/v1/comparisons           创建(管理员)
 * PUT    /api/v1/comparisons/:id     修改(管理员)
 * DELETE /api/v1/comparisons/:id     删除(管理员)
 */

const express = require("express");
const router = express.Router();
const compareService = require("../services/compare.service");
const { adminAuth } = require("../middleware/security");

router.get("/", (req, res) => {
  try {
    const rows = compareService.getComparisons();
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("[Compare Error]", error);
    res.status(500).json({
      success: false,
      error: { code: "COMPARE_ERROR", message: error.message },
    });
  }
});

router.post("/", adminAuth, (req, res) => {
  try {
    const result = compareService.createComparison(req.body || {});
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: error.message },
    });
  }
});

router.put("/:id", adminAuth, (req, res) => {
  try {
    const result = compareService.updateComparison(req.params.id, req.body || {});
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.message === "MISSING_ID") {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_ID", message: "缺少ID" },
      });
    }
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: error.message },
    });
  }
});

router.delete("/:id", adminAuth, (req, res) => {
  try {
    const result = compareService.deleteComparison(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.message === "MISSING_ID") {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_ID", message: "缺少ID" },
      });
    }
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: error.message },
    });
  }
});

module.exports = router;
