/**
 * 动态重载数据库路由
 * GET /api/v1/admin/reload-db  - 重新从磁盘加载数据库
 */
const express = require("express");
const router = express.Router();
const db = require("../db/入口");
const { adminAuth } = require("../middleware/安全");

router.get("/reload-db", adminAuth, async (req, res) => {
  try {
    await db.reloadDB();
    res.json({ success: true, message: "数据库已重新加载" });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "RELOAD_ERROR", message: error.message },
    });
  }
});

module.exports = router;
