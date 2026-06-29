/**
 * ============================================================
 *  自动关联脚本 - 为 Obsidian 词条自动添加双链引用
 * ============================================================
 *
 *  功能说明：
 *    1. 扫描 Obsidian 仓库中的所有词条文件
 *    2. 根据别名和学科自动添加相关词条的双链链接 [[词条名]]
 *    3. 规则：
 *       - 别名匹配：如果词条A的别名是词条B，则添加双向关联
 *       - 同领域关联：相同学科下的词条自动关联（最多3个）
 *
 *  使用方法：
 *    修改下面的 OBSIDIAN_PATH 为你的 Obsidian 仓库路径
 *    然后在命令行运行： node auto-link.js
 * ============================================================
 */

const fs = require("fs");      // 文件系统模块，用于读写文件
const path = require("path");  // 路径处理模块

// ==================== 配置区域 ====================
// Obsidian 仓库的根目录路径（请改成你自己的路径）
const OBSIDIAN_PATH = "E:\\website\\科学不装";

// ==================== 工具函数 ====================

/**
 * 递归查找目录下所有 Markdown 文件
 * @param {string} dir - 要搜索的目录路径
 * @param {string[]} files - 已找到的文件列表（递归用）
 * @returns {string[]} 所有 .md 文件的完整路径
 */
function 查找所有Markdown文件(dir, files = []) {
  const 项目列表 = fs.readdirSync(dir, { withFileTypes: true });
  for (const 项目 of 项目列表) {
    const 完整路径 = path.join(dir, 项目.name);
    if (
      项目.isDirectory() &&           // 如果是目录
      !项目.name.startsWith(".") &&   // 跳过隐藏目录（以.开头）
      项目.name !== "附件"            // 跳过附件目录
    ) {
      查找所有Markdown文件(完整路径, files);  // 递归子目录
    } else if (项目.name.endsWith(".md")) {
      files.push(完整路径);  // 是 .md 文件就加入列表
    }
  }
  return files;
}

/**
 * 解析 Markdown 文件的 frontmatter（YAML头信息）
 * 格式示例：
 *   ---
 *   名称: xxx
 *   学科: xxx
 *   ---
 *   正文内容...
 * @param {string} text - 文件内容
 * @returns {{frontmatter: object, content: string}}
 */
function 解析头部信息(text) {
  const 匹配 = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!匹配) return { frontmatter: {}, content: text };

  const yaml文本 = 匹配[1];
  const 内容 = 匹配[2].trim();
  const 头部信息 = {};

  yaml文本.split("\n").forEach((行) => {
    const 冒号位置 = 行.indexOf(":");
    if (冒号位置 > 0) {
      const 键 = 行.slice(0, 冒号位置).trim();
      let 值 = 行.slice(冒号位置 + 1).trim();

      // 如果是数组格式 [a, b, c]，解析成数组
      if (值.startsWith("[") && 值.endsWith("]")) {
        try {
          值 = JSON.parse(值.replace(/'/g, '"'));
        } catch {
          // JSON解析失败，手动分割
          值 = 值
            .slice(1, -1)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
      }

      头部信息[键] = 值;
    }
  });

  return { frontmatter: 头部信息, content: 内容 };
}

// ==================== 主程序 ====================

console.log("🔍 正在扫描词条文件...\n");

// 第1步：找出所有词条文件
const 所有文件 = 查找所有Markdown文件(OBSIDIAN_PATH);
const 词条文件列表 = 所有文件.filter(
  (f) => f.includes("\\词条\\") || f.includes("/词条/"),
);

console.log(`📁 共找到 ${词条文件列表.length} 个词条文件\n`);

// 第2步：建立索引（名称→路径，学科→名称列表）
const 名称索引表 = {};        // 词条名称 -> 文件路径
const 学科分组表 = {};        // 学科名称 -> 词条名称数组

词条文件列表.forEach((文件路径) => {
  const 文本 = fs.readFileSync(文件路径, "utf-8");
  const { frontmatter } = 解析头部信息(文本);

  const 名称 = frontmatter.名称 || path.basename(文件路径, ".md");
  const 学科 = frontmatter.学科 || "未分类";

  名称索引表[名称] = 文件路径;

  if (!学科分组表[学科]) 学科分组表[学科] = [];
  学科分组表[学科].push(名称);
});

let 总链接数 = 0;     // 统计新增了多少条链接
let 处理文件数 = 0;   // 统计处理了多少个文件

// 第3步：逐个处理词条，添加关联链接
词条文件列表.forEach((文件路径) => {
  const 文本 = fs.readFileSync(文件路径, "utf-8");
  const { frontmatter, content } = 解析头部信息(文本);

  const 名称 = frontmatter.名称 || path.basename(文件路径, ".md");
  const 学科 = frontmatter.学科 || "未分类";
  const 别名列表 = Array.isArray(frontmatter.别名) ? frontmatter.别名 : [];

  const 待添加链接 = new Set();  // 用Set自动去重

  // 规则1：别名匹配（跨学科关联）
  // 如果这个词条的别名恰好是另一个词条，则建立关联
  别名列表.forEach((别名) => {
    if (名称索引表[别名] && 别名 !== 名称) {
      待添加链接.add(别名);
    }
  });

  // 规则2：同领域关联（最多关联3个）
  // 同学科下的其他词条，按顺序挑前3个
  const 相同学科词条 = 学科分组表[学科] || [];
  let 计数 = 0;
  for (const 其他名称 of 相同学科词条) {
    if (其他名称 !== 名称 && !待添加链接.has(其他名称)) {
      待添加链接.add(其他名称);
      计数++;
      if (计数 >= 3) break;  // 最多3个，避免太多
    }
  }

  // 如果没有需要添加的链接，跳过
  if (待添加链接.size === 0) return;

  // 过滤掉已经存在的链接（避免重复添加）
  const 已有链接 = new Set();
  const 链接正则 = /\[\[([^\]]+)\]\]/g;
  let 匹配项;
  while ((匹配项 = 链接正则.exec(content)) !== null) {
    已有链接.add(匹配项[1].trim());
  }

  const 新链接 = Array.from(待添加链接).filter((n) => !已有链接.has(n));
  if (新链接.length === 0) return;  // 没有新链接，跳过

  // 追加到文件末尾
  const 追加内容 =
    "\n\n**相关词条：**\n" + 新链接.map((n) => `- [[${n}]]`).join("\n");
  fs.writeFileSync(文件路径, 文本 + 追加内容, "utf-8");

  处理文件数++;
  总链接数 += 新链接.length;
  console.log(`✅ ${名称}  (+${新链接.length} 个链接)`);
});

// 第4步：输出统计结果
console.log(`\n═══════════════════════════════════════`);
console.log(`  关联完成：${处理文件数} 个文件`);
console.log(`  新增双链：${总链接数} 条`);
console.log(`═══════════════════════════════════════`);
console.log("");
console.log("💡 下一步操作：");
console.log("   1. 回到 Obsidian 按 Ctrl+R 刷新");
console.log("   2. 打开关系图谱查看连线效果");
console.log("   3. 不准确的关联可以手动删除 [[ ]]");
