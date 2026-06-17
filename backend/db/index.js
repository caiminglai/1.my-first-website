/**
 * 数据库入口 —— 直接读写原始数据库文件
 * 设计原则：
 *   1. tongwuyiming.db 是唯一数据源，任何读写都直接操作此文件
 *   2. 若 DB 文件不存在，则从 schema.sql 创建空表
 *   3. 写入操作立即同步到磁盘，确保外部修改立即可见
 *   4. 去掉定时保存机制，避免覆盖外部对数据库文件的修改
 */

const fs = require("fs");
const path = require("path");
let Database;
try {
  Database = require("better-sqlite3");
} catch (e) {
  console.warn("[DB] better-sqlite3 未安装，尝试使用 sql.js");
  Database = null;
}

// ⚠️ 数据库文件路径固定写死，绝对路径
const DB_PATH = "E:\\website\\1.my-first-website\\data\\tongwuyiming.db";
const DATA_DIR = path.dirname(DB_PATH);

let db = null;
let sqlJsMode = false;
let SQL = null;
let _initialized = false;

/** 清空所有缓存 */
function clearAllCaches() {
  try {
    const cache = require("../services/cache");
    if (cache && typeof cache.clearAll === "function") cache.clearAll();
  } catch (_e) { /* 缓存模块可能未初始化 */ }
}

/** 确保数据库文件存在 */
async function ensureDbExists() {
  if (!fs.existsSync(DATA_DIR)) {
    await fs.promises.mkdir(DATA_DIR, { recursive: true });
  }
}

/** 轻量级 Schema 迁移 */
function runMigrations() {
  if (!db) return;
  try {
    const tables = db.exec(
      "SELECT sql FROM sqlite_master WHERE type='table' AND name='terms'",
    );
    const termsTableExists = tables.length > 0 && tables[0].values.length > 0;
    if (termsTableExists && !tables[0].values[0][0].includes("aliases")) {
      db.exec("ALTER TABLE terms ADD COLUMN aliases TEXT DEFAULT '[]'");
      console.log("[DB Migration] terms.aliases 列已添加");
    }
  } catch (err) {
    console.log("[DB Migration] terms.aliases 已存在或无需迁移", err.message);
  }

  try {
    const submissions = db.exec(
      "SELECT sql FROM sqlite_master WHERE type='table' AND name='submissions'",
    );
    const tableExists = submissions.length > 0 && submissions[0].values.length > 0;
    if (tableExists && !submissions[0].values[0][0].includes("submission_type")) {
      db.exec("ALTER TABLE submissions ADD COLUMN submission_type TEXT DEFAULT 'pair'");
      db.exec("ALTER TABLE submissions ADD COLUMN term_name TEXT");
      db.exec("ALTER TABLE submissions ADD COLUMN term_discipline TEXT");
      db.exec("ALTER TABLE submissions ADD COLUMN term_translation TEXT");
      db.exec("ALTER TABLE submissions ADD COLUMN term_essence TEXT");
      db.exec("ALTER TABLE submissions ADD COLUMN term_tip TEXT");
      db.exec("ALTER TABLE submissions ADD COLUMN term_aliases TEXT DEFAULT '[]'");
      console.log("[DB Migration] submissions 扩展列已添加");
    }
  } catch (err) {
    console.log("[DB Migration] submissions 扩展列已存在或无需迁移", err.message);
  }

  try {
    const comparisons = db.exec(
      "SELECT sql FROM sqlite_master WHERE type='table' AND name='comparisons'",
    );
    const cmpExists = comparisons.length > 0 && comparisons[0].values.length > 0;
    if (cmpExists && !comparisons[0].values[0][0].includes("relationship_type")) {
      db.exec("ALTER TABLE comparisons ADD COLUMN relationship_type TEXT DEFAULT '关联性'");
      console.log("[DB Migration] comparisons.relationship_type 列已添加");
    }
  } catch (err) {
    console.log("[DB Migration] comparisons.relationship_type 已存在或无需迁移", err.message);
  }

  try {
    const disciplines = db.exec(
      "SELECT sql FROM sqlite_master WHERE type='table' AND name='disciplines'",
    );
    const discExists = disciplines.length > 0 && disciplines[0].values.length > 0;
    if (discExists && !disciplines[0].values[0][0].includes("description")) {
      db.exec("ALTER TABLE disciplines ADD COLUMN description TEXT DEFAULT ''");
      console.log("[DB Migration] disciplines.description 列已添加");
    }
  } catch (err) {
    console.log("[DB Migration] disciplines.description 已存在或无需迁移", err.message);
  }
}

/** 使用 better-sqlite3 初始化 */
function initBetterSqlite() {
  db = new Database(DB_PATH, { verbose: null });
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  console.log("[DB] 使用 better-sqlite3 直接操作数据库文件:", DB_PATH);
}

/** 使用 sql.js 初始化（备用） */
async function initSqlJsMode() {
  const initSqlJs = require("sql.js");
  SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
    console.log("[DB] 使用 sql.js 加载数据库文件:", DB_PATH);
  } else {
    db = new SQL.Database();
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf-8");
    db.exec(schema);
    const data = db.export();
    const buf = Buffer.from(data.buffer || data, data.byteOffset || 0, data.byteLength || data.length);
    fs.writeFileSync(DB_PATH, buf);
    console.log("[DB] 使用 sql.js 创建新数据库:", DB_PATH);
  }
  sqlJsMode = true;
}

/** 核心初始化 */
async function initDatabase() {
  if (_initialized && db) return;
  try {
    await ensureDbExists();

    if (Database) {
      initBetterSqlite();
    } else {
      await initSqlJsMode();
    }

    _initialized = true;
    runMigrations();

    // 进程退出前关闭连接
    process.on("exit", closeDb);
    process.on("SIGINT", () => { closeDb(); process.exit(0); });
    process.on("SIGTERM", () => { closeDb(); process.exit(0); });
  } catch (error) {
    console.error("[DB Init Error]", error);
    throw error;
  }
}

/** 关闭数据库连接 */
function closeDb() {
  if (db) {
    try {
      if (sqlJsMode) {
        // sql.js 模式：保存到磁盘
        const data = db.export();
        const buf = Buffer.from(data.buffer || data, data.byteOffset || 0, data.byteLength || data.length);
        fs.writeFileSync(DB_PATH, buf);
      }
      db.close();
    } catch (_e) {}
    db = null;
  }
}

// ===================== 服务端查询接口 =====================

/** sql.js 模式的 prepare */
function prepareSqlJs(sql) {
  if (!db) throw new Error("数据库未初始化");
  const stmt = db.prepare(sql);
  return {
    bind: function (params) {
      stmt.bind(params);
      return this;
    },
    all: function (...args) {
      let params = args.length === 1 ? args[0] : args;
      if (params !== undefined && params !== null) {
        if (!Array.isArray(params)) params = [params];
        if (params.length > 0) stmt.bind(params);
      }
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      return rows;
    },
    get: function (...args) {
      let params = args.length === 1 ? args[0] : args;
      if (params !== undefined && params !== null) {
        if (!Array.isArray(params)) params = [params];
        if (params.length > 0) stmt.bind(params);
      }
      let row = null;
      if (stmt.step()) row = stmt.getAsObject();
      stmt.free();
      return row;
    },
    run: function (...args) {
      let params = args.length === 1 ? args[0] : args;
      if (params !== undefined && params !== null) {
        if (!Array.isArray(params)) params = [params];
        if (params.length > 0) stmt.bind(params);
      }
      stmt.step();
      stmt.free();
      // sql.js 模式需要手动保存
      if (sqlJsMode) {
        const data = db.export();
        const buf = Buffer.from(data.buffer || data, data.byteOffset || 0, data.byteLength || data.length);
        fs.writeFileSync(DB_PATH, buf);
      }
      markDirty();
      return { changes: 0, lastInsertRowid: null };
    },
    exec: function () {
      const result = stmt.step();
      stmt.free();
      return result;
    }
  };
}

/** better-sqlite3 模式的 prepare */
function prepareBetter(sql) {
  if (!db) throw new Error("数据库未初始化");
  const stmt = db.prepare(sql);
  return {
    bind: function (params) {
      stmt.bind(params);
      return this;
    },
    all: function (...args) {
      if (sqlJsMode) {
        return prepareSqlJs(sql).all(...args);
      }
      let params = args.length === 1 ? args[0] : args;
      // better-sqlite3: 参数直接传给 all
      if (params !== undefined && params !== null) {
        if (!Array.isArray(params)) params = [params];
        const rows = stmt.all(...params);
        // better-sqlite3: 不需要 free()
        return rows;
      }
      const rows = stmt.all();
      return rows;
    },
    get: function (...args) {
      if (sqlJsMode) {
        return prepareSqlJs(sql).get(...args);
      }
      let params = args.length === 1 ? args[0] : args;
      // better-sqlite3: 参数直接传给 get
      if (params !== undefined && params !== null) {
        if (!Array.isArray(params)) params = [params];
        const row = stmt.get(...params);
        return row;
      }
      const row = stmt.get();
      return row;
    },
    run: function (...args) {
      if (sqlJsMode) {
        return prepareSqlJs(sql).run(...args);
      }
      let params = args.length === 1 ? args[0] : args;
      let result;
      if (params !== undefined && params !== null) {
        if (!Array.isArray(params)) params = [params];
        result = stmt.run(...params);
      } else {
        result = stmt.run();
      }
      markDirty();
      return {
        changes: db.changes,
        lastInsertRowid: db.lastInsertRowid
      };
    },
    exec: function () {
      if (sqlJsMode) {
        return prepareSqlJs(sql).exec();
      }
      const result = stmt.exec();
      return result;
    }
  };
}

function prepare(sql) {
  return prepareBetter(sql);
}

function exec(sql) {
  if (!db) throw new Error("数据库未初始化");
  if (sqlJsMode) {
    return db.exec(sql);
  }
  return db.exec(sql);
}

/** 标记有写入操作发生 —— 清空缓存 */
function markDirty() {
  clearAllCaches();
}

/**
 * 对外导出
 */
module.exports = {
  initDB: initDatabase,
  saveDB: () => {
    // better-sqlite3 模式：写入即保存，无需手动调用
    // sql.js 模式：直接保存
    if (sqlJsMode && db) {
      const data = db.export();
      const buf = Buffer.from(data.buffer || data, data.byteOffset || 0, data.byteLength || data.length);
      fs.writeFileSync(DB_PATH, buf);
    }
  },
  reloadDB: async () => {
    // 重新加载数据库文件
    closeDb();
    if (Database) {
      initBetterSqlite();
    } else {
      await initSqlJsMode();
    }
    clearAllCaches();
    console.log("[DB] 已从磁盘重新加载");
  },
  getDb: () => db,
  prepare,
  exec,
  markDirty,
  DB_PATH,
  closeDb,
};
