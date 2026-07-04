// 同步脚本：将同物异名.db 的全部词条索引到 Meilisearch
// 用法：在 backend/ 目录下执行 node scripts/同步到Meilisearch.js

const path = require("path");

// 确保从 backend/ 目录解析模块
const originalCwd = process.cwd();
process.chdir(path.join(__dirname, ".."));

const db = require("../db/入口");
const meili = require("../services/Meilisearch服务");

async function main() {
  console.log("=== 同步词条到 Meilisearch ===\n");

  // 初始化数据库
  db.initDB();

  // 检查 Meilisearch 是否可用
  const available = await meili.isAvailable();
  if (!available) {
    console.error("错误：Meilisearch 未启动！请先运行 scripts/启动Meilisearch.bat");
    process.exit(1);
  }
  console.log("Meilisearch 连接正常\n");

  // 读取所有词条
  const terms = db.prepare(`
    SELECT t.词条ID as id, t.学科 as discipline, t.名称 as name,
           t.翻译 as translation, t.本质 as essence, t.提示 as tip,
           t.跨学科别名 as aliases, t.热度 as hot
    FROM 词条 t
  `).all();

  // 解析 aliases JSON
  for (const t of terms) {
    try {
      t.aliases = t.aliases ? JSON.parse(t.aliases) : [];
    } catch {
      t.aliases = [];
    }
  }

  console.log(`从数据库读取 ${terms.length} 条词条`);

  // 全量同步
  const count = await meili.fullSync(terms);
  console.log(`\n同步完成！共索引 ${count} 条词条到 Meilisearch`);

  // 测试搜索
  console.log("\n--- 测试搜索 ---");
  const tests = ["熵", "博弈", "neural network", "边际"];
  for (const q of tests) {
    const result = await meili.search(q, 3);
    console.log(`\n搜索 "${q}": ${result.total} 条结果 (${result.processingTimeMs}ms)`);
    for (const hit of result.hits.slice(0, 2)) {
      console.log(`  → ${hit.名称} (${hit.学科}) - ${hit.翻译}`);
    }
  }

  console.log("\n=== 完成 ===");
  process.exit(0);
}

main().catch((err) => {
  console.error("同步失败:", err.message);
  process.exit(1);
});
