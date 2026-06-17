const express = require("express");
const router = express.Router();
const antibodyService = require("../services/antibody.service");
const { adminAuth } = require("../middleware/security");

router.get("/", (req, res) => {
  try {
    const { term_id, category } = req.query;
    const antibodies = antibodyService.getAntibodies(term_id, category);
    res.json({ success: true, data: antibodies });
  } catch (error) {
    console.error("[Antibody Error]", error);
    res.status(500).json({
      success: false,
      error: { code: "ANTIBODY_ERROR", message: error.message },
    });
  }
});

router.get("/categories", (req, res) => {
  try {
    const categories = antibodyService.getCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.get("/export/csv", adminAuth, (req, res) => {
  try {
    const { term_id, category } = req.query;
    const list = antibodyService.getAntibodies(term_id, category);
    const csv = antibodyService.toCSV(list);
    const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="antibody_${ts}.csv"`,
    );
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post("/import/csv", adminAuth, (req, res) => {
  try {
    const { content } = req.body || {};
    if (!content) {
      return res
        .status(400)
        .json({ success: false, error: { message: "请提供 CSV 内容" } });
    }
    const list = antibodyService.parseCSV(content);
    if (!Array.isArray(list) || list.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: { message: "没有可导入的数据" } });
    }
    const result = antibodyService.batchCreate(list);
    res.json({ success: true, data: { ...result, total: list.length } });
  } catch (error) {
    console.error("[Antibody Import Error]", error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post("/", adminAuth, (req, res) => {
  try {
    const result = antibodyService.createAntibody(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.message === "MISSING_FIELDS") {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_FIELDS", message: "缺少必要字段" },
      });
    }
    console.error("[Antibody Create Error]", error);
    res.status(500).json({
      success: false,
      error: { code: "ANTIBODY_CREATE_ERROR", message: error.message },
    });
  }
});

router.delete("/:id", adminAuth, (req, res) => {
  try {
    const result = antibodyService.deleteAntibody(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("[Antibody Delete Error]", error);
    res.status(500).json({
      success: false,
      error: { code: "ANTIBODY_DELETE_ERROR", message: error.message },
    });
  }
});

module.exports = router;
