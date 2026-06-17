const { prepare, markDirty } = require("../db");
const cache = require("./cache");

function getCategories() {
  return cache.remember("job_categories", () => {
    return prepare("SELECT 分类ID as category_id, 分类名称 as name, 分类图标 as icon, 显示顺序 as display_order, 创建时间 as created_at, (SELECT COUNT(*) FROM 岗位 WHERE 分类ID = c.分类ID) as job_count FROM 岗位分类 c ORDER BY 显示顺序").all();
  });
}

function createCategory(data) {
  const { name, icon } = data;

  if (!name) {
    throw new Error("MISSING_NAME");
  }

  const result = prepare(`
    INSERT INTO 岗位分类 (分类名称, 分类图标, 显示顺序)
    VALUES (?, ?, (SELECT COALESCE(MAX(显示顺序), 0) + 1 FROM 岗位分类))
  `).run(name, icon || "📂");
  markDirty();
  cache.invalidate("job_categories");
  return { id: result.lastInsertRowid };
}

function getJobs(categoryId) {
  if (categoryId) {
    return prepare(`
      SELECT j.岗位ID as id, j.分类ID as category_id, j.岗位标识 as job_key, j.岗位标题 as title, j.所属公司 as company, j.薪资范围 as salary, j.学历要求 as education, j.工作经验 as duration, j.岗位介绍 as intro, j.显示顺序 as display_order, c.分类名称 as category_name
      FROM 岗位 j
      LEFT JOIN 岗位分类 c ON j.分类ID = c.分类ID
      WHERE j.分类ID = ?
      ORDER BY c.显示顺序, j.显示顺序
    `).all(categoryId);
  }
  return prepare(`
    SELECT j.岗位ID as id, j.分类ID as category_id, j.岗位标识 as job_key, j.岗位标题 as title, j.所属公司 as company, j.薪资范围 as salary, j.学历要求 as education, j.工作经验 as duration, j.岗位介绍 as intro, j.显示顺序 as display_order, c.分类名称 as category_name
    FROM 岗位 j
    LEFT JOIN 岗位分类 c ON j.分类ID = c.分类ID
    ORDER BY c.显示顺序, j.显示顺序
  `).all();
}

function getJobDetail(jobId) {
  const job = prepare(`
    SELECT j.岗位ID as id, j.分类ID as category_id, j.岗位标识 as job_key, j.岗位标题 as title, j.所属公司 as company, j.薪资范围 as salary, j.学历要求 as education, j.工作经验 as duration, j.岗位介绍 as intro, j.显示顺序 as display_order, c.分类名称 as category_name
    FROM 岗位 j
    LEFT JOIN 岗位分类 c ON j.分类ID = c.分类ID
    WHERE j.岗位ID = ?
  `).get(jobId);

  if (!job) return null;

  const stages = prepare(`
    SELECT 阶段ID as stage_id, 岗位ID as job_id, 阶段序号 as stage_number, 阶段标题 as title, 阶段副标题 as subtitle, 显示顺序 as display_order
    FROM 岗位学习阶段 WHERE 岗位ID = ? ORDER BY 显示顺序
  `).all(jobId);

  for (const stage of stages) {
    stage.skills = prepare(`
      SELECT 技能ID as skill_id, 阶段ID as stage_id, 技能名称 as name, 技能描述 as description, 显示顺序 as display_order
      FROM 岗位技能 WHERE 阶段ID = ? ORDER BY 显示顺序
    `).all(stage.stage_id);
  }

  const resources = prepare(`
    SELECT 资源ID as resource_id, 岗位ID as job_id, 资源类型 as type, 资源标题 as title, 资源描述 as description, 资源链接 as link, 显示顺序 as display_order
    FROM 岗位学习资源 WHERE 岗位ID = ? ORDER BY 显示顺序
  `).all(jobId);

  const project = prepare(`
    SELECT 项目ID as project_id, 岗位ID as job_id, 项目标题 as title, 项目步骤 as steps
    FROM 岗位项目 WHERE 岗位ID = ?
  `).get(jobId);

  const knowledgeCards = prepare(`
    SELECT 卡片ID as card_id, 岗位ID as job_id, 术语 as term, 解释说明 as explanation, 显示顺序 as display_order
    FROM 岗位知识卡片 WHERE 岗位ID = ? ORDER BY 显示顺序
  `).all(jobId);

  return { ...job, stages, resources, project, knowledgeCards };
}

function getAllJobsWithDetails(categoryId) {
  const jobs = getJobs(categoryId);
  if (jobs.length === 0) return [];
  const jobIds = jobs.map((j) => j.id).join(",");

  const allStages = prepare(
    `SELECT 阶段ID as stage_id, 岗位ID as job_id, 阶段序号 as stage_number, 阶段标题 as title, 阶段副标题 as subtitle, 显示顺序 as display_order FROM 岗位学习阶段 WHERE 岗位ID IN (${jobIds}) ORDER BY 显示顺序`,
  ).all();
  const stageIds = allStages.map((s) => s.stage_id).join(",");
  const allSkills = stageIds
    ? prepare(
        `SELECT 技能ID as skill_id, 阶段ID as stage_id, 技能名称 as name, 技能描述 as description, 显示顺序 as display_order FROM 岗位技能 WHERE 阶段ID IN (${stageIds}) ORDER BY 显示顺序`,
      ).all()
    : [];
  const allResources = prepare(
    `SELECT 资源ID as resource_id, 岗位ID as job_id, 资源类型 as type, 资源标题 as title, 资源描述 as description, 资源链接 as link, 显示顺序 as display_order FROM 岗位学习资源 WHERE 岗位ID IN (${jobIds}) ORDER BY 显示顺序`,
  ).all();
  const allProjects = prepare(
    `SELECT 项目ID as project_id, 岗位ID as job_id, 项目标题 as title, 项目步骤 as steps FROM 岗位项目 WHERE 岗位ID IN (${jobIds})`,
  ).all();
  const allKnowledgeCards = prepare(
    `SELECT 卡片ID as card_id, 岗位ID as job_id, 术语 as term, 解释说明 as explanation, 显示顺序 as display_order FROM 岗位知识卡片 WHERE 岗位ID IN (${jobIds}) ORDER BY 显示顺序`,
  ).all();

  const stageToSkills = {};
  for (const skill of allSkills) {
    if (!stageToSkills[skill.stage_id]) stageToSkills[skill.stage_id] = [];
    stageToSkills[skill.stage_id].push(skill);
  }

  const jobToStages = {};
  const jobToResources = {};
  const jobToProject = {};
  const jobToKnowledgeCards = {};

  for (const stage of allStages) {
    if (!jobToStages[stage.job_id]) jobToStages[stage.job_id] = [];
    stage.skills = stageToSkills[stage.stage_id] || [];
    jobToStages[stage.job_id].push(stage);
  }
  for (const r of allResources) {
    if (!jobToResources[r.job_id]) jobToResources[r.job_id] = [];
    jobToResources[r.job_id].push(r);
  }
  for (const p of allProjects) {
    jobToProject[p.job_id] = p;
  }
  for (const kc of allKnowledgeCards) {
    if (!jobToKnowledgeCards[kc.job_id]) jobToKnowledgeCards[kc.job_id] = [];
    jobToKnowledgeCards[kc.job_id].push(kc);
  }

  return jobs.map((job) => ({
    ...job,
    stages: jobToStages[job.id] || [],
    resources: jobToResources[job.id] || [],
    project: jobToProject[job.id] || null,
    knowledgeCards: jobToKnowledgeCards[job.id] || [],
  }));
}

function createJob(data) {
  const {
    categoryId,
    jobKey,
    title,
    company,
    salary,
    education,
    duration,
    intro,
    displayOrder,
  } = data;

  if (!categoryId || !jobKey || !title) {
    throw new Error("MISSING_FIELDS");
  }

  const result = prepare(`
    INSERT INTO 岗位 (分类ID, 岗位标识, 岗位标题, 所属公司, 薪资范围, 学历要求, 工作经验, 岗位介绍, 显示顺序)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    categoryId,
    jobKey,
    title,
    company,
    salary,
    education,
    duration,
    intro,
    displayOrder || 0,
  );
  markDirty();
  cache.invalidate("job_detailed", "jobs_list", "job_categories");
  return { id: result.lastInsertRowid };
}

function updateJob(jobId, data) {
  const {
    categoryId,
    title,
    company,
    salary,
    education,
    duration,
    intro,
    displayOrder,
  } = data;

  prepare(`
    UPDATE 岗位
    SET 分类ID = ?, 岗位标题 = ?, 所属公司 = ?, 薪资范围 = ?, 学历要求 = ?, 工作经验 = ?, 岗位介绍 = ?, 显示顺序 = ?
    WHERE 岗位ID = ?
  `).run(
    categoryId,
    title,
    company,
    salary,
    education,
    duration,
    intro,
    displayOrder,
    jobId,
  );
  markDirty();
  cache.invalidate("job_detailed", "jobs_list", "job_categories");
  return { id: jobId };
}

function deleteJob(jobId) {
  prepare("DELETE FROM 岗位学习资源 WHERE 岗位ID = ?").run(jobId);
  prepare(
    "DELETE FROM 岗位技能 WHERE 阶段ID IN (SELECT 阶段ID FROM 岗位学习阶段 WHERE 岗位ID = ?)",
  ).run(jobId);
  prepare("DELETE FROM 岗位学习阶段 WHERE 岗位ID = ?").run(jobId);
  prepare("DELETE FROM 岗位项目 WHERE 岗位ID = ?").run(jobId);
  prepare("DELETE FROM 岗位知识卡片 WHERE 岗位ID = ?").run(jobId);
  prepare("DELETE FROM 岗位 WHERE 岗位ID = ?").run(jobId);
  markDirty();
  cache.invalidate("job_detailed", "jobs_list", "job_categories");
  return { id: jobId };
}

function createStage(data) {
  const { jobId, stageNumber, title, subtitle, displayOrder } = data;

  if (!jobId || !stageNumber || !title) {
    throw new Error("MISSING_FIELDS");
  }

  const result = prepare(`
    INSERT INTO 岗位学习阶段 (岗位ID, 阶段序号, 阶段标题, 阶段副标题, 显示顺序)
    VALUES (?, ?, ?, ?, ?)
  `).run(jobId, stageNumber, title, subtitle, displayOrder || 0);
  markDirty();
  cache.invalidate("job_detailed", "jobs_list");
  return { id: result.lastInsertRowid };
}

function createSkill(data) {
  const { stageId, name, description, displayOrder } = data;

  if (!stageId || !name) {
    throw new Error("MISSING_FIELDS");
  }

  const result = prepare(`
    INSERT INTO 岗位技能 (阶段ID, 技能名称, 技能描述, 显示顺序)
    VALUES (?, ?, ?, ?)
  `).run(stageId, name, description, displayOrder || 0);
  markDirty();
  cache.invalidate("job_detailed", "jobs_list");
  return { id: result.lastInsertRowid };
}

function batchCreateJobs(list) {
  if (!Array.isArray(list) || list.length === 0) throw new Error("EMPTY");
  let count = 0;
  for (const item of list) {
    const {
      categoryId,
      category_id,
      jobKey,
      job_key,
      title,
      company,
      salary,
      education,
      duration,
      intro,
      displayOrder,
      display_order,
    } = item;
    const cid = Number(categoryId || category_id);
    const jk = jobKey || job_key;
    const do_val = displayOrder !== undefined ? displayOrder : display_order;
    if (cid && jk && title) {
      prepare(
        `INSERT INTO 岗位 (分类ID, 岗位标识, 岗位标题, 所属公司, 薪资范围, 学历要求, 工作经验, 岗位介绍, 显示顺序) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        cid,
        jk,
        title,
        company || "",
        salary || "",
        education || "",
        duration || "",
        intro || "",
        Number(do_val) || 0,
      );
      count++;
    }
  }
  markDirty();
  cache.invalidate("job_detailed", "jobs_list", "job_categories");
  return { success: count, failed: list.length - count };
}

function toCSV(jobs) {
  const cols = [
    "id",
    "category_name",
    "job_key",
    "title",
    "company",
    "salary",
    "education",
    "duration",
    "intro",
    "display_order",
  ];
  const header = [
    "ID",
    "分类",
    "岗位Key",
    "岗位名称",
    "公司",
    "薪资",
    "学历",
    "周期",
    "简介",
    "排序",
  ];
  const esc = (v) => {
    if (v === null || v === undefined) return "";
    let s = String(v);
    if (
      s.includes(",") ||
      s.includes('"') ||
      s.includes("\n") ||
      s.includes("\r")
    ) {
      s = '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  const rows = [header.join(",")];
  for (const j of jobs) {
    rows.push(cols.map((col) => esc(j[col])).join(","));
  }
  return "\uFEFF" + rows.join("\r\n");
}

function parseCSV(text) {
  if (!text || typeof text !== "string") return [];
  const body = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const parseLine = (line) => {
    const result = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (line[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          cur += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ",") {
          result.push(cur);
          cur = "";
        } else {
          cur += ch;
        }
      }
    }
    result.push(cur);
    return result;
  };
  const records = [];
  let buf = "";
  let inQ = false;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (ch === '"') {
      if (inQ && body[i + 1] === '"') {
        buf += '"';
        i++;
      } else {
        inQ = !inQ;
        buf += '"';
      }
    } else if ((ch === "\n" || ch === "\r") && !inQ) {
      records.push(buf);
      buf = "";
      if (ch === "\r" && body[i + 1] === "\n") i++;
    } else {
      buf += ch;
    }
  }
  if (buf.trim().length > 0 || records.length > 0) records.push(buf);
  const lines = records.filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const normalizedHeader = parseLine(lines[0]).map((c) => c.trim());
  const items = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseLine(lines[i]);
    if (cells.every((c) => !c || !c.trim())) continue;
    const obj = {};
    normalizedHeader.forEach((key, idx) => {
      let field = key;
      const mapping = {
        ID: "id",
        分类: "category_name",
        岗位Key: "job_key",
        岗位名称: "title",
        公司: "company",
        薪资: "salary",
        学历: "education",
        周期: "duration",
        简介: "intro",
        排序: "display_order",
      };
      if (mapping[field]) field = mapping[field];
      obj[field] = (cells[idx] || "").trim();
    });
    items.push(obj);
  }
  return items;
}

module.exports = {
  getCategories,
  createCategory,
  getJobs,
  getJobDetail,
  getAllJobsWithDetails,
  createJob,
  updateJob,
  deleteJob,
  createStage,
  createSkill,
  batchCreateJobs,
  toCSV,
  parseCSV,
};