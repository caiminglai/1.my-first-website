const express = require("express");
const router = express.Router();
const industryService = require("../services/industry.service");
const { adminAuth } = require("../middleware/security");

router.get("/", (req, res) => {
  try {
    const industries = industryService.getIndustries();
    res.json({ success: true, data: industries });
  } catch (error) {
    console.error("[Industry Error]", error);
    res.status(500).json({
      success: false,
      error: { code: "INDUSTRY_ERROR", message: error.message },
    });
  }
});

router.get("/:id", (req, res) => {
  try {
    const detail = industryService.getIndustryDetail(req.params.id);
    if (!detail) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "产业不存在" },
      });
    }
    res.json({ success: true, data: detail });
  } catch (error) {
    console.error("[Industry Detail Error]", error);
    res.status(500).json({
      success: false,
      error: { code: "INDUSTRY_DETAIL_ERROR", message: error.message },
    });
  }
});

router.post("/", adminAuth, (req, res) => {
  try {
    const result = industryService.createIndustry(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.message === "MISSING_FIELDS") {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_FIELDS", message: "缺少必要字段" },
      });
    }
    console.error("[Industry Create Error]", error);
    res.status(500).json({
      success: false,
      error: { code: "INDUSTRY_CREATE_ERROR", message: error.message },
    });
  }
});

router.delete("/:id", adminAuth, (req, res) => {
  try {
    const result = industryService.deleteIndustry(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("[Industry Delete Error]", error);
    res.status(500).json({
      success: false,
      error: { code: "INDUSTRY_DELETE_ERROR", message: error.message },
    });
  }
});

module.exports = router;
