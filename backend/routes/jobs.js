/**
 * 岗位管理路由
 */

const express = require("express");
const router = express.Router();
const jobsService = require("../services/jobs.service");
const { adminAuth } = require("../middleware/security");

router.get("/categories", (req, res) => {
  try {
    const categories = jobsService.getCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("[Jobs] Error getting categories:", error);
    res.status(500).json({ success: false, error: "获取分类失败" });
  }
});

router.post("/categories", adminAuth, (req, res) => {
  try {
    const result = jobsService.createCategory(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.message === "MISSING_NAME") {
      return res
        .status(400)
        .json({ success: false, error: "分类名称不能为空" });
    }
    console.error("[Jobs] Error creating category:", error);
    res.status(500).json({ success: false, error: "创建分类失败" });
  }
});

router.get("/", (req, res) => {
  try {
    const { categoryId } = req.query;
    const jobs = jobsService.getJobs(categoryId);
    res.json({ success: true, data: jobs });
  } catch (error) {
    console.error("[Jobs] Error getting jobs:", error);
    res.status(500).json({ success: false, error: "获取岗位失败" });
  }
});

// 带详情的列表接口（N+1优化）- 返回所有岗位及其stages/skills/resources
router.get("/detailed", (req, res) => {
  try {
    const { categoryId } = req.query;
    const jobs = jobsService.getAllJobsWithDetails(categoryId);
    res.json({ success: true, data: jobs });
  } catch (error) {
    console.error("[Jobs] Error getting detailed jobs:", error);
    res.status(500).json({ success: false, error: "获取岗位详情失败" });
  }
});

router.get("/:id", (req, res) => {
  try {
    const detail = jobsService.getJobDetail(req.params.id);
    if (!detail) {
      return res.status(404).json({ success: false, error: "岗位不存在" });
    }
    res.json({ success: true, data: detail });
  } catch (error) {
    console.error("[Jobs] Error getting job detail:", error);
    res.status(500).json({ success: false, error: "获取岗位详情失败" });
  }
});

router.post("/", adminAuth, (req, res) => {
  try {
    const result = jobsService.createJob(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.message === "MISSING_FIELDS") {
      return res.status(400).json({ success: false, error: "缺少必要字段" });
    }
    console.error("[Jobs] Error creating job:", error);
    res.status(500).json({ success: false, error: "创建岗位失败" });
  }
});

router.put("/:id", adminAuth, (req, res) => {
  try {
    jobsService.updateJob(req.params.id, req.body);
    res.json({ success: true });
  } catch (error) {
    console.error("[Jobs] Error updating job:", error);
    res.status(500).json({ success: false, error: "更新岗位失败" });
  }
});

router.delete("/:id", adminAuth, (req, res) => {
  try {
    jobsService.deleteJob(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("[Jobs] Error deleting job:", error);
    res.status(500).json({ success: false, error: "删除岗位失败" });
  }
});

router.get("/export/csv", adminAuth, (req, res) => {
  try {
    const { categoryId } = req.query;
    const list = jobsService.getJobs(categoryId);
    const csv = jobsService.toCSV(list);
    const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="jobs_${ts}.csv"`,
    );
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/import/csv", adminAuth, (req, res) => {
  try {
    const { content } = req.body || {};
    if (!content) {
      return res.status(400).json({ success: false, error: "请提供 CSV 内容" });
    }
    const list = jobsService.parseCSV(content);
    if (!Array.isArray(list) || list.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "没有可导入的数据" });
    }
    const result = jobsService.batchCreateJobs(list);
    res.json({ success: true, data: { ...result, total: list.length } });
  } catch (error) {
    console.error("[Jobs Import Error]", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/:id/stages", adminAuth, (req, res) => {
  try {
    const result = jobsService.createStage({
      ...req.body,
      jobId: req.params.id,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.message === "MISSING_FIELDS") {
      return res.status(400).json({ success: false, error: "缺少必要字段" });
    }
    console.error("[Jobs] Error creating stage:", error);
    res.status(500).json({ success: false, error: "创建阶段失败" });
  }
});

router.post("/:id/stages/:stageId/skills", adminAuth, (req, res) => {
  try {
    const result = jobsService.createSkill({
      ...req.body,
      stageId: req.params.stageId,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.message === "MISSING_FIELDS") {
      return res.status(400).json({ success: false, error: "缺少必要字段" });
    }
    console.error("[Jobs] Error creating skill:", error);
    res.status(500).json({ success: false, error: "创建技能失败" });
  }
});

module.exports = router;
