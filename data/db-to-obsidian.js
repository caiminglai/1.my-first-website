const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

// ==================== 配置（改成你的实际路径）====================
const DB_PATH = path.join(__dirname, "tongwuyiming.db");
const OBSIDIAN_PATH = "E:\website\科学不装"; // ← 改成你的 Obsidian 仓库路径

// 学科名称映射
const disciplineMap = {};

// ==================== 工具函数 ====================

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function safeFileName(name) {
  // 替换Windows不允许的文件名字符
  return name.replace(/[\\\\/:*?"<>|]/g, "_").trim();
}

function parseAliases(jsonStr) {
  try {
    const arr = JSON.parse(jsonStr);
    if (Array.isArray(arr)) return arr;
  } catch {}
  return [];
}

// ==================== 导出：词条 ====================

function exportTerms(db) {
  console.log("📤 导出词条...");
  const rows = db.prepare("SELECT * FROM 词条").all();

  for (const row of rows) {
    const disciplineName = disciplineMap[row.学科] || row.学科 || "未分类";
    const dir = path.join(OBSIDIAN_PATH, "词条", disciplineName);
    ensureDir(dir);

    const fileName = safeFileName(row.名称) + ".md";
    const filePath = path.join(dir, fileName);

    const aliases = parseAliases(row.跨学科别名);
    const aliasLinks = aliases.map((a) => `- [[${a}]]`).join("\n");
    const aliasYaml = JSON.stringify(aliases).replace(/"/g, '\\"');

    const content = `---
类型: 词条
词条ID: ${row.词条ID}
学科: ${disciplineName}
热度: ${row.热度 || 0}
创建时间: ${row.创建时间 || new Date().toISOString()}
别名: ${aliasYaml}
---

# ${row.名称}

**专业说法：** ${row.专业说法 || ""}

**人话翻译：** 
${row.翻译 || ""}

**本质：** ${row.本质 || ""}

**提示：** ${row.提示 || ""}

**跨学科别名：**
${aliasLinks || "- "}

**相关术语：**
- 
`;

    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`  ✅ ${disciplineName}/${fileName}`);
  }
  console.log(`   共导出 ${rows.length} 个词条\n`);
}

// ==================== 导出：概念抗体 ====================

function exportAntibodies(db) {
  console.log("📤 导出概念抗体...");
  const rows = db.prepare("SELECT * FROM 概念抗体").all();

  for (const row of rows) {
    const disciplineName = row.学科 || "未分类";
    const dir = path.join(OBSIDIAN_PATH, "概念抗体", disciplineName);
    ensureDir(dir);

    const fileName = safeFileName(row.概念名称) + ".md";
    const filePath = path.join(dir, fileName);

    const content = `---
类型: 概念抗体
抗体ID: ${row.抗体ID}
学科: ${disciplineName}
创建时间: ${row.创建时间 || new Date().toISOString()}
---

# ${row.概念名称}

**常见误解（人话版）：**
${row.常见误解 || ""}

**正确理解（人话版）：**
${row.正确理解 || ""}

**为什么容易搞混：**
${row.为什么搞混 || ""}

**一句话记住：**
${row.一句话记住 || ""}

**真实案例：**
${row.真实案例 || ""}

**相关抗体：**
- 
`;

    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`  ✅ ${disciplineName}/${fileName}`);
  }
  console.log(`   共导出 ${rows.length} 个概念抗体\n`);
}

// ==================== 导出：职业解构 ====================

function exportCareers(db) {
  console.log("📤 导出职业解构...");
  const rows = db.prepare("SELECT * FROM 职业解构").all();

  for (const row of rows) {
    const category = row.分类 || "未分类";
    const dir = path.join(OBSIDIAN_PATH, "职业解构", category);
    ensureDir(dir);

    const fileName = safeFileName(row.职业名称) + ".md";
    const filePath = path.join(dir, fileName);

    const content = `---
类型: 职业解构
职业ID: ${row.职业ID}
分类: ${category}
创建时间: ${row.创建时间 || new Date().toISOString()}
---

# ${row.职业名称}

**一句话定义：**
${row.一句话定义 || ""}

**是干嘛的（人话版）：**
${row.是干嘛的 || ""}

**日常做什么：**
${row.日常做什么 || ""}

**学习路径：**
${row.学习路径 || ""}

**核心技能：**
${row.核心技能 || ""}

**容易掉的坑：**
${row.容易掉的坑 || ""}

**相关职业：**
- 
`;

    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`  ✅ ${category}/${fileName}`);
  }
  console.log(`   共导出 ${rows.length} 个职业解构\n`);
}

// ==================== 导出：岗位拆解 ====================

function exportJobs(db) {
  console.log("📤 导出岗位拆解...");
  const rows = db.prepare("SELECT * FROM 岗位").all();

  for (const row of rows) {
    const category = row.分类ID || "未分类";
    const dir = path.join(OBSIDIAN_PATH, "岗位拆解", category);
    ensureDir(dir);

    const fileName = safeFileName(row.岗位名称) + ".md";
    const filePath = path.join(dir, fileName);

    const content = `---
类型: 岗位拆解
岗位ID: ${row.岗位ID}
分类ID: ${category}
创建时间: ${row.创建时间 || new Date().toISOString()}
---

# ${row.岗位名称}

**行业黑话翻译：**
${row.行业黑话翻译 || ""}

**实际工作内容（人话版）：**
${row.实际工作内容 || ""}

**薪资真相：**
${row.薪资真相 || ""}

**入门门槛：**
${row.入门门槛 || ""}

**学习阶段：**
${row.学习阶段 || ""}

**必备技能：**
${row.必备技能 || ""}

**避坑指南：**
${row.避坑指南 || ""}

**相关岗位：**
- 
`;

    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`  ✅ ${category}/${fileName}`);
  }
  console.log(`   共导出 ${rows.length} 个岗位拆解\n`);
}

// ==================== 导出：概念对比 ====================

function exportComparisons(db) {
  console.log("📤 导出概念对比...");
  const rows = db.prepare("SELECT * FROM 概念对比").all();

  for (const row of rows) {
    const dir = path.join(OBSIDIAN_PATH, "概念对比");
    ensureDir(dir);

    const fileName = safeFileName(row.标题) + ".md";
    const filePath = path.join(dir, fileName);

    const content = `---
类型: 概念对比
对比ID: ${row.对比ID}
关系类型: ${row.关系类型 || "关联性"}
创建时间: ${row.创建时间 || new Date().toISOString()}
---

# ${row.标题}

## 概念A：${row.概念A名称}

**所属学科：** ${row.概念A学科 || ""}

**人话翻译：** ${row.概念A通俗解释 || ""}

**表现症状：** ${row.概念A表现 || ""}

**生活类比：** ${row.概念A类比 || ""}

**解决办法：** ${row.概念A解决 || ""}

## 概念B：${row.概念B名称}

**所属学科：** ${row.概念B学科 || ""}

**人话翻译：** ${row.概念B通俗解释 || ""}

**表现症状：** ${row.概念B表现 || ""}

**生活类比：** ${row.概念B类比 || ""}

**解决办法：** ${row.概念B解决 || ""}

## 总结

**一句话区分：** ${row.总结 || ""}
`;

    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`  ✅ ${fileName}`);
  }
  console.log(`   共导出 ${rows.length} 个概念对比\n`);
}

// ==================== 加载学科映射 ====================

function loadDisciplines(db) {
  try {
    const rows = db.prepare("SELECT 学科ID, 学科名称 FROM 学科").all();
    for (const row of rows) {
      disciplineMap[row.学科ID] = row.学科名称;
    }
    console.log(`📚 加载了 ${rows.length} 个学科映射\n`);
  } catch {
    console.log("⚠️ 未找到学科表，使用原始ID\n");
  }
}

// ==================== 主程序 ====================

function main() {
  console.log("═══════════════════════════════════════════");
  console.log("  科学不装 · DB → Obsidian 导出工具");
  console.log("═══════════════════════════════════════════");
  console.log(`数据库: ${DB_PATH}`);
  console.log(`Obsidian: ${OBSIDIAN_PATH}`);
  console.log("");

  if (!fs.existsSync(DB_PATH)) {
    console.error("❌ 数据库文件不存在，请检查路径");
    process.exit(1);
  }

  ensureDir(OBSIDIAN_PATH);

  const db = new Database(DB_PATH);

  // 加载学科名称映射
  loadDisciplines(db);

  // 导出五大模块
  exportTerms(db);
  exportAntibodies(db);
  exportCareers(db);
  exportJobs(db);
  exportComparisons(db);

  db.close();

  console.log("═══════════════════════════════════════════");
  console.log("  ✅ 导出完成！");
  console.log("═══════════════════════════════════════════");
  console.log("");
  console.log("下一步：");
  console.log("1. 打开 Obsidian，确认文件已出现在对应文件夹");
  console.log("2. 在 Obsidian 里编辑、修改内容");
  console.log("3. 改完后用 git push + sync.sh 同步回网站");
}

main();
