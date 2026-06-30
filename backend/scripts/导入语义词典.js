#!/usr/bin/env node
/**
 * 导入 ChineseSemanticKB 语义词典到 SQLite
 *
 * 数据来源：https://github.com/liuhuanyong/ChineseSemanticKB
 * 导入到：data/语义词典.db
 *
 * 用法：
 *   node backend/scripts/导入语义词典.js [ChineseSemanticKB路径]
 *
 * 默认路径：E:/website/4.clone-others-projects/ChineseSemanticKB
 */

const path = require('path');
const fs = require('fs');

// ── 路径配置 ──
const KB_ROOT = process.argv[2] ||
  'E:/website/4.clone-others-projects/ChineseSemanticKB';
const DICT_DIR = path.join(KB_ROOT, 'dict');
const DB_PATH = path.join(__dirname, '..', '..', 'data', '语义词典.db');

// ── 检查来源 ──
if (!fs.existsSync(DICT_DIR)) {
  console.error(`错误：找不到词典目录 ${DICT_DIR}`);
  console.error('用法：node scripts/导入语义词典.js [ChineseSemanticKB路径]');
  process.exit(1);
}

// ── 创建数据库 ──
const Database = require('better-sqlite3');

// 删除旧库重建
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log('已删除旧数据库');
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

console.log('');
console.log('╔══════════════════════════════════════════════╗');
console.log('║   ChineseSemanticKB → SQLite 导入工具       ║');
console.log('╚══════════════════════════════════════════════╝');
console.log('');
console.log(`来源：${DICT_DIR}`);
console.log(`目标：${DB_PATH}`);
console.log('');

// ── 建表 ──
db.exec(`
  -- 同义关系（同物异名的核心数据）
  CREATE TABLE IF NOT EXISTS 同义关系 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    主词 TEXT NOT NULL,
    同义词 TEXT NOT NULL,
    UNIQUE(主词, 同义词)
  );

  -- 反义关系
  CREATE TABLE IF NOT EXISTS 反义关系 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    词1 TEXT NOT NULL,
    词2 TEXT NOT NULL,
    UNIQUE(词1, 词2)
  );

  -- 简称关系（全称↔简称）
  CREATE TABLE IF NOT EXISTS 简称关系 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    全称 TEXT NOT NULL,
    简称 TEXT NOT NULL,
    UNIQUE(全称, 简称)
  );

  -- 抽象关系（上下位概念）
  CREATE TABLE IF NOT EXISTS 抽象关系 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    具体词 TEXT NOT NULL,
    上位概念 TEXT NOT NULL,
    UNIQUE(具体词, 上位概念)
  );

  -- 索引：加速按词查询
  CREATE INDEX idx_同义_主词 ON 同义关系(主词);
  CREATE INDEX idx_同义_同义词 ON 同义关系(同义词);
  CREATE INDEX idx_反义_词1 ON 反义关系(词1);
  CREATE INDEX idx_反义_词2 ON 反义关系(词2);
  CREATE INDEX idx_简称_全称 ON 简称关系(全称);
  CREATE INDEX idx_简称_简称 ON 简称关系(简称);
  CREATE INDEX idx_抽象_具体 ON 抽象关系(具体词);
  CREATE INDEX idx_抽象_上位 ON 抽象关系(上位概念);
`);

console.log('数据表已创建');
console.log('');

// ── 导入函数 ──
function readFile(name) {
  const p = path.join(DICT_DIR, name);
  return fs.readFileSync(p, 'utf8').split('\n').filter(l => l.trim());
}

// 1. 同义关系库
console.log('导入 同义关系库...');
const synonyms = readFile('同义关系库.txt');
const insertSynonym = db.prepare('INSERT OR IGNORE INTO 同义关系 (主词, 同义词) VALUES (?, ?)');
const importSynonyms = db.transaction(() => {
  for (const line of synonyms) {
    const parts = line.split(',');
    if (parts.length >= 3) {
      insertSynonym.run(parts[0].trim(), parts[2].trim());
    }
  }
});
importSynonyms();
console.log(`  ✓ 同义关系: ${synonyms.length} 条`);

// 2. 反义关系库
console.log('导入 反义关系库...');
const antonyms = readFile('反义关系库.txt');
const insertAntonym = db.prepare('INSERT OR IGNORE INTO 反义关系 (词1, 词2) VALUES (?, ?)');
const importAntonyms = db.transaction(() => {
  for (const line of antonyms) {
    const parts = line.split('@');
    if (parts.length === 2) {
      insertAntonym.run(parts[0].trim(), parts[1].trim());
    }
  }
});
importAntonyms();
console.log(`  ✓ 反义关系: ${antonyms.length} 条`);

// 3. 简称关系库
console.log('导入 简称关系库...');
const abbrevs = readFile('简称关系库.txt');
const insertAbbrev = db.prepare('INSERT OR IGNORE INTO 简称关系 (全称, 简称) VALUES (?, ?)');
const importAbbrevs = db.transaction(() => {
  for (const line of abbrevs) {
    const parts = line.split(',');
    if (parts.length >= 3) {
      insertAbbrev.run(parts[0].trim(), parts[2].trim());
    }
  }
});
importAbbrevs();
console.log(`  ✓ 简称关系: ${abbrevs.length} 条`);

// 4. 抽象关系库
console.log('导入 抽象关系库...');
const abstractions = readFile('抽象关系库.txt');
const insertAbstract = db.prepare('INSERT OR IGNORE INTO 抽象关系 (具体词, 上位概念) VALUES (?, ?)');
const importAbstracts = db.transaction(() => {
  for (const line of abstractions) {
    const parts = line.split(',');
    if (parts.length >= 3) {
      insertAbstract.run(parts[0].trim(), parts[2].trim());
    }
  }
});
importAbstracts();
console.log(`  ✓ 抽象关系: ${abstractions.length} 条`);

// ── 统计 ──
console.log('');
console.log('══════════════════════════════════════');
console.log('导入完成！统计：');
const counts = {
  '同义关系': db.prepare('SELECT COUNT(*) as c FROM 同义关系').get().c,
  '反义关系': db.prepare('SELECT COUNT(*) as c FROM 反义关系').get().c,
  '简称关系': db.prepare('SELECT COUNT(*) as c FROM 简称关系').get().c,
  '抽象关系': db.prepare('SELECT COUNT(*) as c FROM 抽象关系').get().c,
};
for (const [name, count] of Object.entries(counts)) {
  console.log(`  ${name}: ${count.toLocaleString()} 条`);
}
const dbSize = (fs.statSync(DB_PATH).size / 1024 / 1024).toFixed(2);
console.log(`  数据库大小: ${dbSize} MB`);
console.log('══════════════════════════════════════');

db.close();
console.log('');
console.log('完成！数据库已保存到 data/语义词典.db');
