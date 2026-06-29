/**
 * ============================================================
 *  数据库导出到 Obsidian 工具
 * ============================================================
 *
 *  功能说明：
 *    将 SQLite 数据库中的所有数据导出为 Obsidian 格式的 Markdown 文件
 *    支持导出：词条、概念抗体、职业解构、岗位拆解、概念对比
 *
 *  使用方法：
 *    1. 修改下面的 OBSIDIAN_PATH 为你的 Obsidian 仓库路径
 *    2. 在命令行运行： node db-to-obsidian.js
 * ============================================================
 */

const fs = require("fs");           // 文件系统模块
const path = require("path");       // 路径处理模块
const Database = require("better-sqlite3");  // SQLite 数据库

// ==================== 配置区域 ====================

// 数据库文件路径（默认指向项目 data 目录下的数据库）
const 数据库路径 = path.join(__dirname, "..", "..", "data", "tongwuyiming.db");

// Obsidian 仓库根目录路径（请改成你自己的路径）
const Obsidian仓库路径 = "E:\\website\\科学不装";

// 学科ID -> 学科名称 的映射表（运行时从数据库加载）
const 学科映射表 = {};

// ==================== 工具函数 ====================

/**
 * 确保目录存在，不存在则创建
 * @param {string} dir - 目录路径
 */
function 确保目录存在(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });  // recursive 支持多级目录创建
  }
}

/**
 * 生成安全的文件名（替换Windows不允许的字符）
 * @param {string} name - 原始名称
 * @returns {string} 安全的文件名
 */
function 安全文件名(name) {
  // Windows 不允许的字符： \ / : * ? " < > |
  return name.replace(/[\\/:*?"<>|]/g, "_").trim();
}

/**
 * 解析 JSON 格式的别名数组（容错处理）
 * @param {string} jsonStr - JSON字符串
 * @returns {string[]} 别名数组
 */
function 解析别名(jsonStr) {
  try {
    const 数组 = JSON.parse(jsonStr);
    if (Array.isArray(数组)) return 数组;
  } catch {
    // 解析失败返回空数组
  }
  return [];
}

// ==================== 导出函数 ====================

/**
 * 导出词条表到 Obsidian
 * 每个词条生成一个 .md 文件，按学科分类到子目录
 */
function 导出词条(数据库) {
  console.log("📤 正在导出词条...");
  const 数据行 = 数据库.prepare("SELECT * FROM 词条").all();

  for (const 行 of 数据行) {
    const 学科名称 = 学科映射表[行.学科] || 行.学科 || "未分类";
    const 目录 = path.join(Obsidian仓库路径, "词条", 学科名称);
    确保目录存在(目录);

    const 文件名 = 安全文件名(行.名称) + ".md";
    const 文件路径 = path.join(目录, 文件名);

    const 别名列表 = 解析别名(行.跨学科别名);
    const 别名链接 = 别名列表.map((a) => `- [[${a}]]`).join("\n");
    const 别名Yaml = JSON.stringify(别名列表).replace(/"/g, '\\"');

    const 文件内容 = `---
类型: 词条
词条ID: ${行.词条ID}
学科: ${学科名称}
热度: ${行.热度 || 0}
创建时间: ${行.创建时间 || new Date().toISOString()}
别名: ${别名Yaml}
---

# ${行.名称}

**专业说法：** ${行.专业说法 || ""}

**人话翻译：** 
${行.翻译 || ""}

**本质：** ${行.本质 || ""}

**提示：** ${行.提示 || ""}

**跨学科别名：**
${别名链接 || "- "}

**相关术语：**
- 
`;

    fs.writeFileSync(文件路径, 文件内容, "utf-8");
    console.log(`  ✅ ${学科名称}/${文件名}`);
  }
  console.log(`   共导出 ${数据行.length} 个词条\n`);
}

/**
 * 导出概念抗体表到 Obsidian
 */
function 导出概念抗体(数据库) {
  console.log("📤 正在导出概念抗体...");
  const 数据行 = 数据库.prepare("SELECT * FROM 概念抗体").all();

  for (const 行 of 数据行) {
    const 学科名称 = 行.学科 || "未分类";
    const 目录 = path.join(Obsidian仓库路径, "概念抗体", 学科名称);
    确保目录存在(目录);

    const 文件名 = 安全文件名(行.概念名称) + ".md";
    const 文件路径 = path.join(目录, 文件名);

    const 文件内容 = `---
类型: 概念抗体
抗体ID: ${行.抗体ID}
学科: ${学科名称}
创建时间: ${行.创建时间 || new Date().toISOString()}
---

# ${行.概念名称}

**常见误解（人话版）：**
${行.常见误解 || ""}

**正确理解（人话版）：**
${行.正确理解 || ""}

**为什么容易搞混：**
${行.为什么搞混 || ""}

**一句话记住：**
${行.一句话记住 || ""}

**真实案例：**
${行.真实案例 || ""}

**相关抗体：**
- 
`;

    fs.writeFileSync(文件路径, 文件内容, "utf-8");
    console.log(`  ✅ ${学科名称}/${文件名}`);
  }
  console.log(`   共导出 ${数据行.length} 个概念抗体\n`);
}

/**
 * 导出职业解构表到 Obsidian
 */
function 导出职业解构(数据库) {
  console.log("📤 正在导出职业解构...");
  const 数据行 = 数据库.prepare("SELECT * FROM 职业解构").all();

  for (const 行 of 数据行) {
    const 分类 = 行.分类 || "未分类";
    const 目录 = path.join(Obsidian仓库路径, "职业解构", 分类);
    确保目录存在(目录);

    const 文件名 = 安全文件名(行.职业名称) + ".md";
    const 文件路径 = path.join(目录, 文件名);

    const 文件内容 = `---
类型: 职业解构
职业ID: ${行.职业ID}
分类: ${分类}
创建时间: ${行.创建时间 || new Date().toISOString()}
---

# ${行.职业名称}

**一句话定义：**
${行.一句话定义 || ""}

**是干嘛的（人话版）：**
${行.是干嘛的 || ""}

**日常做什么：**
${行.日常做什么 || ""}

**学习路径：**
${行.学习路径 || ""}

**核心技能：**
${行.核心技能 || ""}

**容易掉的坑：**
${行.容易掉的坑 || ""}

**相关职业：**
- 
`;

    fs.writeFileSync(文件路径, 文件内容, "utf-8");
    console.log(`  ✅ ${分类}/${文件名}`);
  }
  console.log(`   共导出 ${数据行.length} 个职业解构\n`);
}

/**
 * 导出岗位拆解表到 Obsidian
 */
function 导出岗位拆解(数据库) {
  console.log("📤 正在导出岗位拆解...");
  const 数据行 = 数据库.prepare("SELECT * FROM 岗位").all();

  for (const 行 of 数据行) {
    const 分类 = 行.分类ID || "未分类";
    const 目录 = path.join(Obsidian仓库路径, "岗位拆解", 分类);
    确保目录存在(目录);

    const 文件名 = 安全文件名(行.岗位名称) + ".md";
    const 文件路径 = path.join(目录, 文件名);

    const 文件内容 = `---
类型: 岗位拆解
岗位ID: ${行.岗位ID}
分类ID: ${分类}
创建时间: ${行.创建时间 || new Date().toISOString()}
---

# ${行.岗位名称}

**行业黑话翻译：**
${行.行业黑话翻译 || ""}

**实际工作内容（人话版）：**
${行.实际工作内容 || ""}

**薪资真相：**
${行.薪资真相 || ""}

**入门门槛：**
${行.入门门槛 || ""}

**学习阶段：**
${行.学习阶段 || ""}

**必备技能：**
${行.必备技能 || ""}

**避坑指南：**
${行.避坑指南 || ""}

**相关岗位：**
- 
`;

    fs.writeFileSync(文件路径, 文件内容, "utf-8");
    console.log(`  ✅ ${分类}/${文件名}`);
  }
  console.log(`   共导出 ${数据行.length} 个岗位拆解\n`);
}

/**
 * 导出概念对比表到 Obsidian
 */
function 导出概念对比(数据库) {
  console.log("📤 正在导出概念对比...");
  const 数据行 = 数据库.prepare("SELECT * FROM 概念对比").all();

  for (const 行 of 数据行) {
    const 目录 = path.join(Obsidian仓库路径, "概念对比");
    确保目录存在(目录);

    const 文件名 = 安全文件名(行.标题) + ".md";
    const 文件路径 = path.join(目录, 文件名);

    const 文件内容 = `---
类型: 概念对比
对比ID: ${行.对比ID}
关系类型: ${行.关系类型 || "关联性"}
创建时间: ${行.创建时间 || new Date().toISOString()}
---

# ${行.标题}

## 概念A：${行.概念A名称}

**所属学科：** ${行.概念A学科 || ""}

**人话翻译：** ${行.概念A通俗解释 || ""}

**表现症状：** ${行.概念A表现 || ""}

**生活类比：** ${行.概念A类比 || ""}

**解决办法：** ${行.概念A解决 || ""}

## 概念B：${行.概念B名称}

**所属学科：** ${行.概念B学科 || ""}

**人话翻译：** ${行.概念B通俗解释 || ""}

**表现症状：** ${行.概念B表现 || ""}

**生活类比：** ${行.概念B类比 || ""}

**解决办法：** ${行.概念B解决 || ""}

## 总结

**一句话区分：** ${行.总结 || ""}
`;

    fs.writeFileSync(文件路径, 文件内容, "utf-8");
    console.log(`  ✅ ${文件名}`);
  }
  console.log(`   共导出 ${数据行.length} 个概念对比\n`);
}

// ==================== 辅助函数 ====================

/**
 * 从数据库加载学科名称映射表
 * 将 学科ID 映射为 学科名称，方便导出时显示中文名
 */
function 加载学科映射(数据库) {
  try {
    const 数据行 = 数据库.prepare("SELECT 学科ID, 学科名称 FROM 学科").all();
    for (const 行 of 数据行) {
      学科映射表[行.学科ID] = 行.学科名称;
    }
    console.log(`📚 加载了 ${数据行.length} 个学科映射\n`);
  } catch {
    console.log("⚠️ 未找到学科表，使用原始ID\n");
  }
}

// ==================== 主程序入口 ====================

function 主程序() {
  console.log("═══════════════════════════════════════════");
  console.log("  科学不装 · 数据库 → Obsidian 导出工具");
  console.log("═══════════════════════════════════════════");
  console.log(`数据库: ${数据库路径}`);
  console.log(`Obsidian: ${Obsidian仓库路径}`);
  console.log("");

  // 检查数据库文件是否存在
  if (!fs.existsSync(数据库路径)) {
    console.error("❌ 数据库文件不存在，请检查路径配置");
    process.exit(1);
  }

  // 确保输出目录存在
  确保目录存在(Obsidian仓库路径);

  // 打开数据库连接
  const 数据库 = new Database(数据库路径);

  // 先加载学科映射（后面导出词条时需要用到）
  加载学科映射(数据库);

  // 依次导出各个模块
  导出词条(数据库);
  导出概念抗体(数据库);
  导出职业解构(数据库);
  导出岗位拆解(数据库);
  导出概念对比(数据库);

  // 关闭数据库
  数据库.close();

  console.log("═══════════════════════════════════════════");
  console.log("  ✅ 全部导出完成！");
  console.log("═══════════════════════════════════════════");
  console.log("");
  console.log("下一步操作：");
  console.log("1. 打开 Obsidian，确认文件已出现在对应文件夹");
  console.log("2. 在 Obsidian 里编辑、修改内容");
  console.log("3. 改完后用同步工具同步回网站数据库");
}

主程序();
