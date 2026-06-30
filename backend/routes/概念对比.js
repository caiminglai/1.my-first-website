/**
 * 概念对比路由
 * GET    /api/v1/comparisons           全部对比
 * POST   /api/v1/comparisons           创建(管理员)
 * PUT    /api/v1/comparisons/:id     修改(管理员)
 * DELETE /api/v1/comparisons/:id     删除(管理员)
 */

const express = require("express");
const router = express.Router();
const compareService = require("../services/概念对比");
const { adminAuth } = require("../middleware/安全");

// Obsidian 同步（非阻塞）
let obsidianSync = null;
try {
  obsidianSync = require("../services/Obsidian同步");
} catch { /* 同步服务不可用 */ }

function syncComparisonToObsidian(cmpId) {
  if (!obsidianSync) return;
  try {
    const { prepare } = require("../db/入口");
    const raw = prepare("SELECT * FROM 概念对比 WHERE 对比ID = ?").get(cmpId);
    if (raw) obsidianSync.writeComparisonToObsidian(raw);
  } catch (e) {
    console.warn("[Obsidian Sync] 概念对比回写失败:", e.message);
  }
}
function deleteComparisonObsidian(cmpId) {
  if (!obsidianSync) return;
  try {
    const { prepare } = require("../db/入口");
    const info = prepare("SELECT 标题 FROM 概念对比 WHERE 对比ID = ?").get(cmpId);
    if (info) obsidianSync.deleteComparisonFromObsidian(info);
  } catch (e) {
    console.warn("[Obsidian Sync] 概念对比删除回写失败:", e.message);
  }
}

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
    const body = req.body || {};
    if (!body.conceptA || !body.conceptB) {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_FIELDS", message: "缺少必要字段: conceptA, conceptB" },
      });
    }
    const result = compareService.createComparison(body);
    syncComparisonToObsidian(result.id);
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.message === "MISSING_FIELDS") {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_FIELDS", message: "缺少必要字段" },
      });
    }
    console.error("[Compare] Create error:", error);
    res.status(500).json({
      success: false,
      error: { code: "CREATE_COMPARE_ERROR", message: error.message },
    });
  }
});

router.put("/:id", adminAuth, (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: "NO_FIELDS", message: "没有要更新的字段" },
      });
    }
    const result = compareService.updateComparison(req.params.id, req.body);
    syncComparisonToObsidian(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.message === "MISSING_ID") {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_ID", message: "缺少ID" },
      });
    }
    if (error.message === "MISSING_FIELDS" || error.message === "NO_FIELDS") {
      return res.status(400).json({
        success: false,
        error: { code: error.message, message: error.message === "NO_FIELDS" ? "没有要更新的字段" : "缺少必要字段" },
      });
    }
    console.error("[Compare] Update error:", error);
    res.status(500).json({
      success: false,
      error: { code: "UPDATE_COMPARE_ERROR", message: error.message },
    });
  }
});

router.delete("/:id", adminAuth, (req, res) => {
  try {
    // 先查询标题（用于删除 Obsidian 文件）
    deleteComparisonObsidian(req.params.id);
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
