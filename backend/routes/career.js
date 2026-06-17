const express = require("express");
const router = express.Router();
const careerService = require("../services/career.service");
const { adminAuth } = require("../middleware/security");

router.get("/", (req, res) => {
  try {
    const { category } = req.query;
    const careers = careerService.getCareers(category);
    res.json({ success: true, data: careers });
  } catch (error) {
    console.error("[Career Error]", error);
    res.status(500).json({
      success: false,
      error: { code: "CAREER_ERROR", message: error.message },
    });
  }
});

router.get("/categories", (req, res) => {
  try {
    const categories = careerService.getCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.get("/export/csv", adminAuth, (req, res) => {
  try {
    const { category } = req.query;
    const list = careerService.getCareers(category);
    const csv = careerService.toCSV(list);
    const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="career_${ts}.csv"`,
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
    const list = careerService.parseCSV(content);
    if (!Array.isArray(list) || list.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: { message: "没有可导入的数据" } });
    }
    const result = careerService.batchCreate(list);
    res.json({ success: true, data: { ...result, total: list.length } });
  } catch (error) {
    console.error("[Career Import Error]", error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.get("/:id", (req, res) => {
  try {
    const detail = careerService.getCareerDetail(req.params.id);
    if (!detail) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "职业不存在" },
      });
    }
    res.json({ success: true, data: detail });
  } catch (error) {
    console.error("[Career Detail Error]", error);
    res.status(500).json({
      success: false,
      error: { code: "CAREER_DETAIL_ERROR", message: error.message },
    });
  }
});

router.post("/", adminAuth, (req, res) => {
  try {
    const result = careerService.createCareer(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.message === "MISSING_FIELDS") {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_FIELDS", message: "缺少必要字段" },
      });
    }
    console.error("[Career Create Error]", error);
    res.status(500).json({
      success: false,
      error: { code: "CAREER_CREATE_ERROR", message: error.message },
    });
  }
});

router.delete("/:id", adminAuth, (req, res) => {
  try {
    const result = careerService.deleteCareer(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("[Career Delete Error]", error);
    res.status(500).json({
      success: false,
      error: { code: "CAREER_DELETE_ERROR", message: error.message },
    });
  }
});

module.exports = router;
