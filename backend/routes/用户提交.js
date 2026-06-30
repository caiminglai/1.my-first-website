const express = require("express");
const router = express.Router();
const submissionsService = require("../services/用户提交");
const { adminAuth } = require("../middleware/安全");

router.get("/", (req, res) => {
  try {
    const list = submissionsService.getSubmissions("pending");
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: error.message },
    });
  }
});

router.get("/approved", (req, res) => {
  try {
    const list = submissionsService.getSubmissions("approved");
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: error.message },
    });
  }
});

router.post("/", (req, res) => {
  try {
    const result = submissionsService.createSubmission(req.body || {});
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.message === "MISSING_FIELDS") {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_FIELDS",
          message: "缺少必填字段（term1 / term2）",
        },
      });
    }
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: error.message },
    });
  }
});

router.get("/admin", adminAuth, (req, res) => {
  try {
    const { status } = req.query;
    const list = submissionsService.getSubmissions(status);
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: error.message },
    });
  }
});

router.put("/admin/:id", adminAuth, (req, res) => {
  try {
    const { status, review_note } = req.body || {};
    const result = submissionsService.updateStatus(
      req.params.id,
      status,
      review_note,
    );
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.message === "MISSING_ID") {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_ID", message: "缺少ID" },
      });
    }
    if (error.message === "MISSING_STATUS") {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_STATUS", message: "缺少状态" },
      });
    }
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: error.message },
    });
  }
});

router.delete("/admin/stats", adminAuth, (req, res) => {
  try {
    const stats = submissionsService.getCountByStatus();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: error.message },
    });
  }
});

router.post("/admin/:id/approve", adminAuth, (req, res) => {
  try {
    const result = submissionsService.approveSubmission(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.message === "MISSING_ID") {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_ID", message: "缺少ID" },
      });
    }
    if (error.message === "NOT_FOUND") {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "提交不存在" },
      });
    }
    if (error.message === "MISSING_FIELDS") {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_FIELDS", message: "缺少必填字段" },
      });
    }
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: error.message },
    });
  }
});

router.post("/admin/:id/reject", adminAuth, (req, res) => {
  try {
    const result = submissionsService.rejectSubmission(req.params.id);
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

router.delete("/admin/:id", adminAuth, (req, res) => {
  try {
    const result = submissionsService.deleteSubmission(req.params.id);
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
