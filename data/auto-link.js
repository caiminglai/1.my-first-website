const fs = require("fs");
const path = require("path");

// ==================== 配置 ====================
const OBSIDIAN_PATH = "E:\\website\\科学不装";

// ==================== 工具函数 ====================

function findAllMarkdownFiles(dir, files = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (
      item.isDirectory() &&
      !item.name.startsWith(".") &&
      item.name !== "附件"
    ) {
      findAllMarkdownFiles(fullPath, files);
    } else if (item.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }
  return files;
}

function parseFrontmatter(text) {
  const match = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content: text };

  const yamlText = match[1];
  const content = match[2].trim();
  const frontmatter = {};

  yamlText.split("\n").forEach((line) => {
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();

      if (value.startsWith("[") && value.endsWith("]")) {
        try {
          value = JSON.parse(value.replace(/'/g, '"'));
        } catch {
          value = value
            .slice(1, -1)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
      }

      frontmatter[key] = value;
    }
  });

  return { frontmatter, content };
}

// ==================== 主程序 ====================

console.log("🔍 扫描词条文件...\n");

const allFiles = findAllMarkdownFiles(OBSIDIAN_PATH);
const termFiles = allFiles.filter(
  (f) => f.includes("\\词条\\") || f.includes("/词条/"),
);

console.log(`📁 找到 ${termFiles.length} 个词条文件\n`);

// 建立索引
const nameIndex = {};
const disciplineGroups = {};

termFiles.forEach((filePath) => {
  const text = fs.readFileSync(filePath, "utf-8");
  const { frontmatter } = parseFrontmatter(text);

  const name = frontmatter.名称 || path.basename(filePath, ".md");
  const discipline = frontmatter.学科 || "未分类";

  nameIndex[name] = filePath;

  if (!disciplineGroups[discipline]) disciplineGroups[discipline] = [];
  disciplineGroups[discipline].push(name);
});

let totalLinks = 0;
let fixedFiles = 0;

// 处理每个词条
termFiles.forEach((filePath) => {
  const text = fs.readFileSync(filePath, "utf-8");
  const { frontmatter, content } = parseFrontmatter(text);

  const name = frontmatter.名称 || path.basename(filePath, ".md");
  const discipline = frontmatter.学科 || "未分类";
  const aliases = Array.isArray(frontmatter.别名) ? frontmatter.别名 : [];

  const linksToAdd = new Set();

  // 规则1：别名匹配（跨学科关联）
  aliases.forEach((alias) => {
    if (nameIndex[alias] && alias !== name) {
      linksToAdd.add(alias);
    }
  });

  // 规则2：同领域关联（最多3个）
  const sameDiscipline = disciplineGroups[discipline] || [];
  let count = 0;
  for (const otherName of sameDiscipline) {
    if (otherName !== name && !linksToAdd.has(otherName)) {
      linksToAdd.add(otherName);
      count++;
      if (count >= 3) break;
    }
  }

  if (linksToAdd.size === 0) return;

  // 过滤已存在的
  const existingLinks = new Set();
  const linkRegex = /\[\[([^\]]+)\]\]/g;
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    existingLinks.add(match[1].trim());
  }

  const newLinks = Array.from(linksToAdd).filter((n) => !existingLinks.has(n));
  if (newLinks.length === 0) return;

  // 追加
  const appendText =
    "\n\n**相关词条：**\n" + newLinks.map((n) => `- [[${n}]]`).join("\n");
  fs.writeFileSync(filePath, text + appendText, "utf-8");

  fixedFiles++;
  totalLinks += newLinks.length;
  console.log(`✅ ${name}  (+${newLinks.length} 个链接)`);
});

console.log(`\n═══════════════════════════════════════`);
console.log(`  关联完成：${fixedFiles} 个文件`);
console.log(`  新增双链：${totalLinks} 条`);
console.log(`═══════════════════════════════════════`);
console.log("");
console.log("💡 下一步：");
console.log("   1. 回到 Obsidian 按 Ctrl+R 刷新");
console.log("   2. 打开关系图谱查看连线");
console.log("   3. 不准确的关联手动删除 [[ ]]");
