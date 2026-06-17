const express = require("express");
const router = express.Router();
const adminService = require("../services/admin.service");
const dataQualityService = require("../services/dataquality.service");
const { adminAuth } = require("../middleware/security");
const fs = require("fs");
const path = require("path");

router.use(adminAuth);

// 在线数据库迁移（不需要重启）
router.post("/migrate", (req, res) => {
  try {
    const { exec } = require("../db");
    // comparisons.relationship_type
    const cmpSql = exec("SELECT sql FROM sqlite_master WHERE type='table' AND name='comparisons'");
    const cmpExists = cmpSql.length > 0 && cmpSql[0].values.length > 0;
    if (cmpExists && !cmpSql[0].values[0][0].includes("relationship_type")) {
      exec("ALTER TABLE comparisons ADD COLUMN relationship_type TEXT DEFAULT '关联性'");
    }
    // disciplines.description
    const discSql = exec("SELECT sql FROM sqlite_master WHERE type='table' AND name='disciplines'");
    const discExists = discSql.length > 0 && discSql[0].values.length > 0;
    if (discExists && !discSql[0].values[0][0].includes("description")) {
      exec("ALTER TABLE disciplines ADD COLUMN description TEXT DEFAULT ''");
    }
    // terms.aliases
    const termsSql = exec("SELECT sql FROM sqlite_master WHERE type='table' AND name='terms'");
    const termsExists = termsSql.length > 0 && termsSql[0].values.length > 0;
    if (termsExists && !termsSql[0].values[0][0].includes("aliases")) {
      exec("ALTER TABLE terms ADD COLUMN aliases TEXT DEFAULT '[]'");
    }
    const { markDirty, saveDB } = require("../db");
    markDirty();
    saveDB();
    res.json({ success: true, message: "数据库迁移完成" });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "MIGRATE_ERROR", message: error.message } });
  }
});

router.get("/terms", (req, res) => {
  try {
    const { page, pageSize, search, discipline } = req.query;
    const { terms, total } = adminService.getAdminTerms(
      page,
      pageSize,
      search,
      discipline,
    );
    res.json({
      success: true,
      data: {
        terms,
        total,
        page: parseInt(page) || 1,
        pageSize: parseInt(pageSize) || 20,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: error.message },
    });
  }
});

router.get("/terms/export/csv", (req, res) => {
  try {
    const { discipline } = req.query;
    const terms = adminService.getTermsByDiscipline(discipline || null);
    const csv = adminService.termsToCsv(terms);
    const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="terms_${ts}.csv"`,
    );
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post("/terms/import/csv", (req, res) => {
  try {
    const { content } = req.body || {};
    if (!content || typeof content !== "string") {
      return res
        .status(400)
        .json({ success: false, error: { message: "请提供 CSV 内容" } });
    }
    const list = adminService.parseCsvToTerms(content);
    if (!Array.isArray(list) || list.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: { message: "没有可导入的数据" } });
    }
    const normalized = list.map((item, idx) => ({
      id: item.id || item.term_id || `auto_${Date.now()}_${idx}`,
      discipline: item.discipline || "cross",
      name: item.name || item.term || "",
      translation: item.translation || item.translate || "",
      essence: item.essence || item.description || "",
      tip: item.tip || item.hint || "",
      hot:
        item.hot === "是" ||
        item.hot === 1 ||
        item.hot === "1" ||
        item.hot === true ||
        item.hot === "true",
    }));
    const result = adminService.batchCreateTerms(normalized);
    res.json({ success: true, data: { ...result, total: list.length } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post("/terms", (req, res) => {
  try {
    const result = adminService.batchCreateTerms(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: error.message },
    });
  }
});

router.put("/terms/:id", (req, res) => {
  try {
    const result = adminService.updateAdminTerm(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.message === "NO_FIELDS") {
      return res.status(400).json({
        success: false,
        error: { code: "NO_FIELDS", message: "没有要更新的字段" },
      });
    }
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: error.message },
    });
  }
});

router.delete("/terms/:id", (req, res) => {
  try {
    const result = adminService.deleteAdminTerm(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: error.message },
    });
  }
});

router.get("/terms/:id/history", (req, res) => {
  try {
    const data = adminService.getTermHistory(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: error.message },
    });
  }
});

router.post("/graph/links", (req, res) => {
  try {
    const { sourceId, targetId, label } = req.body;
    const result = adminService.addGraphLink(sourceId, targetId, label);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: error.message },
    });
  }
});

router.delete("/graph/links", (req, res) => {
  try {
    const { source, target } = req.query;
    const result = adminService.deleteGraphLink(source, target);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: error.message },
    });
  }
});

router.get("/disciplines", (req, res) => {
  try {
    const disciplines = adminService.getDisciplines();
    res.json({ success: true, data: disciplines });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: error.message },
    });
  }
});

router.post("/disciplines", (req, res) => {
  try {
    const result = adminService.createDiscipline(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.message === "MISSING_FIELDS") {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_FIELDS", message: "缺少必要字段" },
      });
    }
    if (error.message === "INVALID_KEY") {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_KEY",
          message: "学科标识只能包含小写字母和下划线",
        },
      });
    }
    if (error.message === "DUPLICATE_KEY") {
      return res.status(400).json({
        success: false,
        error: { code: "DUPLICATE_KEY", message: "学科标识已存在" },
      });
    }
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: error.message },
    });
  }
});

router.put("/disciplines/order", (req, res) => {
  try {
    const { order } = req.body;
    const result = adminService.updateDisciplineOrder(order);
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.message === "INVALID_ORDER") {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_ORDER", message: "排序数据格式错误" },
      });
    }
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: error.message },
    });
  }
});

router.put("/disciplines/:id", (req, res) => {
  try {
    const result = adminService.updateDiscipline(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.message === "NO_FIELDS") {
      return res.status(400).json({
        success: false,
        error: { code: "NO_FIELDS", message: "没有要更新的字段" },
      });
    }
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: error.message },
    });
  }
});

router.delete("/disciplines/:id", (req, res) => {
  try {
    const result = adminService.deleteDiscipline(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.message.startsWith("HAS_TERMS:")) {
      const count = error.message.split(":")[1];
      return res.status(400).json({
        success: false,
        error: {
          code: "HAS_TERMS",
          message: `该学科下还有 ${count} 个词条，无法删除`,
        },
      });
    }
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: error.message },
    });
  }
});

router.post("/backup", async (req, res) => {
  try {
    // 数据目录已迁移到项目根级
    const backupDir = path.join(__dirname, "..", "..", "data", "backups");
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19);
    const backupPath = path.join(backupDir, `backup_${timestamp}.db`);

    const db = require("../db");
    await db.saveDB();
    const dbPath = path.join(__dirname, "..", "..", "data", "tongwuyiming.db");
    fs.copyFileSync(dbPath, backupPath);

    res.json({ success: true, data: { path: backupPath, timestamp } });
  } catch (err) {
    console.error("[Backup Error]", err);
    res.status(500).json({
      success: false,
      error: { code: "BACKUP_ERROR", message: err.message },
    });
  }
});

router.get("/backups", (req, res) => {
  const backupDir = path.join(__dirname, "..", "..", "data", "backups");
  if (!fs.existsSync(backupDir)) {
    return res.json({ success: true, data: [] });
  }

  const files = fs
    .readdirSync(backupDir)
    .filter((f) => f.endsWith(".db"))
    .map((f) => {
      const stat = fs.statSync(path.join(backupDir, f));
      return { name: f, size: stat.size, date: stat.mtime };
    })
    .sort((a, b) => b.date - a.date);

  res.json({ success: true, data: files });
});

router.get("/dashboard", (req, res) => {
  try {
    const stats = adminService.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: error.message },
    });
  }
});

router.get("/data-quality", (req, res) => {
  try {
    const report = dataQualityService.getQualityReport();
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: error.message },
    });
  }
});

module.exports = router;
