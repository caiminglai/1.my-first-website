/**
 * 岗位管理路由
 */

const express = require("express");
const router = express.Router();
const jobsService = require("../services/高薪技术岗");
const { adminAuth } = require("../middleware/安全");

// Obsidian 同步（非阻塞）
let obsidianSync = null;
try {
  obsidianSync = require("../services/Obsidian同步");
} catch { /* 同步服务不可用 */ }

function syncJobToObsidian(jobId) {
  if (!obsidianSync) return;
  try {
    const fullData = obsidianSync.getJobFullData(Number(jobId));
    if (fullData) obsidianSync.writeJobToObsidian(fullData);
  } catch (e) {
    console.warn("[Obsidian Sync] 岗位回写失败:", e.message);
  }
}
function deleteJobObsidian(jobId) {
  if (!obsidianSync) return;
  try {
    const { prepare } = require("../db/入口");
    const info = prepare(
      `SELECT j.岗位标题, c.分类名称
       FROM 岗位 j LEFT JOIN 岗位分类 c ON j.分类ID = c.分类ID
       WHERE j.岗位ID = ?`
    ).get(jobId);
    if (info) obsidianSync.deleteJobFromObsidian(info);
  } catch (e) {
    console.warn("[Obsidian Sync] 岗位删除回写失败:", e.message);
  }
}

router.get("/categories", (req, res) => {
  try {
    const categories = jobsService.getCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("[Jobs] Error getting categories:", error);
    res.status(500).json({ success: false, error: { code: "GET_CATEGORIES_ERROR", message: "获取分类失败" } });
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
        .json({ success: false, error: { code: "MISSING_NAME", message: "分类名称不能为空" } });
    }
    console.error("[Jobs] Error creating category:", error);
    res.status(500).json({ success: false, error: { code: "CREATE_CATEGORY_ERROR", message: "创建分类失败" } });
  }
});

router.get("/", (req, res) => {
  try {
    const { categoryId } = req.query;
    const jobs = jobsService.getJobs(categoryId);
    res.json({ success: true, data: jobs });
  } catch (error) {
    console.error("[Jobs] Error getting jobs:", error);
    res.status(500).json({ success: false, error: { code: "GET_JOBS_ERROR", message: "获取岗位失败" } });
  }
});

// 带详情的列表接口（N+1优化）- 返回所有岗位及其stages/skills/resources
// 注意：静态路由必须在 /:id 之前，否则 "detailed" 会被当作 :id 参数
router.get("/detailed", (req, res) => {
  try {
    const { categoryId } = req.query;
    const jobs = jobsService.getAllJobsWithDetails(categoryId);
    res.json({ success: true, data: jobs });
  } catch (error) {
    console.error("[Jobs] Error getting detailed jobs:", error);
    res.status(500).json({ success: false, error: { code: "GET_JOBS_ERROR", message: "获取岗位详情失败" } });
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
    res.status(500).json({ success: false, error: { code: "EXPORT_ERROR", message: error.message } });
  }
});

router.post("/import/csv", adminAuth, (req, res) => {
  try {
    const { content } = req.body || {};
    if (!content) {
      return res.status(400).json({ success: false, error: { code: "MISSING_CSV", message: "请提供 CSV 内容" } });
    }
    const list = jobsService.parseCSV(content);
    if (!Array.isArray(list) || list.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: { code: "EMPTY_CSV", message: "没有可导入的数据" } });
    }
    const result = jobsService.batchCreateJobs(list);
    res.json({ success: true, data: { ...result, total: list.length } });
  } catch (error) {
    console.error("[Jobs Import Error]", error);
    res.status(500).json({ success: false, error: { code: "IMPORT_ERROR", message: error.message } });
  }
});

router.get("/:id", (req, res) => {
  try {
    const detail = jobsService.getJobDetail(req.params.id);
    if (!detail) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "岗位不存在" } });
    }
    res.json({ success: true, data: detail });
  } catch (error) {
    console.error("[Jobs] Error getting job detail:", error);
    res.status(500).json({ success: false, error: { code: "GET_JOB_ERROR", message: "获取岗位详情失败" } });
  }
});

router.post("/", adminAuth, (req, res) => {
  try {
    const result = jobsService.createJob(req.body);
    syncJobToObsidian(result.id);
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.message === "MISSING_FIELDS") {
      return res.status(400).json({ success: false, error: { code: "MISSING_FIELDS", message: "缺少必要字段" } });
    }
    console.error("[Jobs] Error creating job:", error);
    res.status(500).json({ success: false, error: { code: "CREATE_JOB_ERROR", message: "创建岗位失败" } });
  }
});

router.put("/:id", adminAuth, (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ success: false, error: { code: "NO_FIELDS", message: "没有要更新的字段" } });
    }
    jobsService.updateJob(req.params.id, req.body);
    syncJobToObsidian(req.params.id);
    res.json({ success: true });
  } catch (error) {
    if (error.message === "MISSING_FIELDS") {
      return res.status(400).json({ success: false, error: { code: "MISSING_FIELDS", message: "缺少必要字段" } });
    }
    console.error("[Jobs] Error updating job:", error);
    res.status(500).json({ success: false, error: { code: "UPDATE_JOB_ERROR", message: "更新岗位失败" } });
  }
});

router.delete("/:id", adminAuth, (req, res) => {
  try {
    // 先查询信息（用于删除 Obsidian 文件）
    deleteJobObsidian(req.params.id);
    jobsService.deleteJob(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("[Jobs] Error deleting job:", error);
    res.status(500).json({ success: false, error: { code: "DELETE_JOB_ERROR", message: "删除岗位失败" } });
  }
});

router.post("/:id/stages", adminAuth, (req, res) => {
  try {
    const result = jobsService.createStage({
      ...req.body,
      jobId: req.params.id,
    });
    syncJobToObsidian(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.message === "MISSING_FIELDS") {
      return res.status(400).json({ success: false, error: { code: "MISSING_FIELDS", message: "缺少必要字段" } });
    }
    console.error("[Jobs] Error creating stage:", error);
    res.status(500).json({ success: false, error: { code: "CREATE_STAGE_ERROR", message: "创建阶段失败" } });
  }
});

router.post("/:id/stages/:stageId/skills", adminAuth, (req, res) => {
  try {
    const result = jobsService.createSkill({
      ...req.body,
      stageId: req.params.stageId,
    });
    syncJobToObsidian(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.message === "MISSING_FIELDS") {
      return res.status(400).json({ success: false, error: { code: "MISSING_FIELDS", message: "缺少必要字段" } });
    }
    console.error("[Jobs] Error creating skill:", error);
    res.status(500).json({ success: false, error: { code: "CREATE_SKILL_ERROR", message: "创建技能失败" } });
  }
});

module.exports = router;
