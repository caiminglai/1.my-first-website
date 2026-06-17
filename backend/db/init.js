/**
 * 数据库初始化脚本（严格安全模式）
 *
 * 规则：
 *   1. 数据库文件路径固定为: E:\website\1.my-first-website\data\tongwuyiming.db
 *   2. 若数据库文件已存在，则**跳过所有初始化**，直接退出
 *   3. 仅使用 CREATE TABLE IF NOT EXISTS，绝不使用 DROP TABLE
 *   4. 绝不主动删除 .db 文件
 *   5. 启动命令无任何 --init / --reset / --seed 类参数，即 node server.js
 *
 * 用法：
 *   node db/init.js        (仅首次部署，文件已存在会直接跳过)
 *   node server.js         (日常启动，自动加载已有数据库)
 */

const fs = require("fs");
const path = require("path");
const initSqlJs = require("sql.js");

// 规则 1：路径固定写死，绝对路径，不随运行目录变化
const DB_PATH = "E:\\website\\1.my-first-website\\data\\tongwuyiming.db";
const DATA_DIR = path.dirname(DB_PATH);
const SCHEMA_PATH = path.join(__dirname, "schema.sql");

async function init() {
  try {
    // 规则 2：文件存在则**跳过所有初始化**，立刻退出
    if (fs.existsSync(DB_PATH)) {
      console.log("[INIT] 数据库文件已存在，跳过所有初始化 -> " + DB_PATH);
      console.log("[INIT] 直接启动后端服务即可：node server.js");
      return;
    }

    // 首次部署：目录不存在则创建
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // 规则 3：仅执行 CREATE TABLE IF NOT EXISTS 脚本创建新数据库
    const SQL = await initSqlJs();
    const schema = fs.readFileSync(SCHEMA_PATH, "utf-8");

    const db = new SQL.Database();
    db.exec(schema);
    console.log("[INIT] 已从 schema.sql 创建空数据库（仅使用 CREATE TABLE IF NOT EXISTS）");

    const data = db.export();
    const buffer = Buffer.from(
      data.buffer || data,
      data.byteOffset || 0,
      data.byteLength || data.length,
    );
    fs.writeFileSync(DB_PATH, buffer);
    console.log("[INIT] 空数据库已保存到: " + DB_PATH);
    db.close();
  } catch (error) {
    console.error("[INIT Error]", error);
    process.exit(1);
  }
}

// 仅 CLI 模式（直接运行 node init.js）才自动执行
if (require.main === module) {
  init();
}

module.exports = init;
module.exports.DB_PATH = DB_PATH;
