/**
 * ============================================================
 *  Obsidian 同步 CLI 脚本
 * ============================================================
 *
 *  使用方法：
 *    node scripts/db-to-obsidian.js [选项]
 *
 *  选项：
 *    --full          全量同步所有模块（默认）
 *    --terms         只同步词条
 *    --compare       只同步概念对比
 *    --antibody      只同步概念抗体
 *    --jobs          只同步岗位拆解
 *    --no-clean      不清理孤立文件
 *    --clean-only    只清理孤立文件，不写入
 *
 *  环境变量：
 *    OBSIDIAN_VAULT_PATH  Obsidian 仓库路径
 *    DB_PATH              数据库文件路径
 * ============================================================
 */

const path = require("path");

// 初始化数据库
const db = require("../db/入口");
db.initDB();

// 加载同步服务
const obsidianSync = require("../services/Obsidian同步");

// 解析命令行参数
const args = process.argv.slice(2);
const options = {
  full: args.includes("--full") || args.length === 0,
  terms: args.includes("--terms"),
  compare: args.includes("--compare"),
  antibody: args.includes("--antibody"),
  jobs: args.includes("--jobs"),
  noClean: args.includes("--no-clean"),
  cleanOnly: args.includes("--clean-only"),
};

function main() {
  console.log("");
  console.log("╔═══════════════════════════════════════════╗");
  console.log("║   科学不装 · 数据库→Obsidian 同步           ║");
  console.log("╚═══════════════════════════════════════════╝");
  console.log("");
  console.log(`数据库: ${db.DB_PATH}`);
  console.log(`Obsidian: ${obsidianSync.VAULT_PATH}`);
  console.log("");

  if (options.cleanOnly) {
    console.log("🧹 仅清理模式...\n");
    const result = obsidianSync.cleanAllOrphans();
    for (const [mod, stat] of Object.entries(result)) {
      console.log(`  ${mod}: 删除 ${stat.removed} 个孤立文件`);
    }
    console.log("\n✅ 清理完成！\n");
    db.closeDb();
    return;
  }

  // 确定要同步的模块
  let modules = null; // null = 全部
  if (options.terms || options.compare || options.antibody || options.jobs) {
    modules = [];
    if (options.terms) modules.push("词条");
    if (options.compare) modules.push("概念对比");
    if (options.antibody) modules.push("概念抗体");
    if (options.jobs) modules.push("岗位拆解");
  }

  // 执行同步
  const results = obsidianSync.fullSync({
    cleanOrphans: !options.noClean,
    modules,
  });

  // 输出汇总
  console.log("📊 同步汇总：");
  const summary = {};
  for (const mod of ["词条", "概念对比", "概念抗体", "岗位拆解"]) {
    if (results[mod]) {
      summary[mod] = `写入 ${results[mod].written}，失败 ${results[mod].errors}`;
    }
  }
  if (results.清理) {
    for (const [mod, stat] of Object.entries(results.清理)) {
      if (stat.removed > 0) {
        summary[`${mod}(清理)`] = `删除 ${stat.removed}`;
      }
    }
  }
  for (const [key, val] of Object.entries(summary)) {
    console.log(`  ${key}: ${val}`);
  }
  console.log("");

  db.closeDb();
}

main();
