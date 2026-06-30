#!/usr/bin/env node
/**
 * 导入 DomainWordsDict 学科领域词库到 SQLite
 *
 * 数据来源：https://github.com/liuhuanyong/DomainWordsDict
 * 68个领域，916万词
 *
 * 用法：
 *   node backend/scripts/导入学科词库.js [DomainWordsDict路径]
 */

const path = require('path');
const fs = require('fs');

const KB_ROOT = process.argv[2] ||
  'E:/website/4.clone-others-projects/DomainWordsDict';
const DATA_DIR = path.join(KB_ROOT, 'data');
const DB_PATH = path.join(__dirname, '..', '..', 'data', '学科词库.db');

if (!fs.existsSync(DATA_DIR)) {
  console.error('错误：找不到数据目录 ' + DATA_DIR);
  process.exit(1);
}

// 删除旧库重建
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log('已删除旧数据库');
}

const Database = require('better-sqlite3');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = -64000'); // 64MB cache

console.log('');
console.log('╔══════════════════════════════════════════════╗');
console.log('║   DomainWordsDict → SQLite 导入工具         ║');
console.log('╚══════════════════════════════════════════════╝');
console.log('');
console.log('来源：' + DATA_DIR);
console.log('目标：' + DB_PATH);
console.log('');

// 建表
db.exec(`
  CREATE TABLE IF NOT EXISTS 学科词库 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    学科 TEXT NOT NULL,
    词语 TEXT NOT NULL,
    权重 INTEGER DEFAULT 1,
    UNIQUE(学科, 词语)
  );

  CREATE INDEX idx_学科 ON 学科词库(学科);
  CREATE INDEX idx_词语 ON 学科词库(词语);
  CREATE INDEX idx_学科词语 ON 学科词库(学科, 词语);
`);

console.log('数据表已创建');
console.log('');

// 获取所有txt文件
const files = fs.readdirSync(DATA_DIR)
  .filter(f => f.endsWith('.txt'))
  .sort();

console.log('共 ' + files.length + ' 个学科文件');
console.log('');

const insert = db.prepare('INSERT OR IGNORE INTO 学科词库 (学科, 词语, 权重) VALUES (?, ?, ?)');
let totalWords = 0;

for (const file of files) {
  const domain = file.replace('.txt', '');
  const filePath = path.join(DATA_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').filter(l => l.trim());

  const importBatch = db.transaction(() => {
    for (const line of lines) {
      const parts = line.split('\t');
      const word = parts[0].trim();
      const weight = parseInt(parts[1]) || 1;
      if (word) {
        insert.run(domain, word, weight);
      }
    }
  });

  importBatch();
  totalWords += lines.length;
  console.log('  ✓ ' + domain + ': ' + lines.length.toLocaleString() + ' 词');
}

console.log('');
console.log('══════════════════════════════════════');
console.log('导入完成！');
console.log('  学科数: ' + files.length);
console.log('  总词数: ' + totalWords.toLocaleString());
const dbCount = db.prepare('SELECT COUNT(*) as c FROM 学科词库').get().c;
console.log('  数据库记录: ' + dbCount.toLocaleString());
const dbSize = (fs.statSync(DB_PATH).size / 1024 / 1024).toFixed(1);
console.log('  数据库大小: ' + dbSize + ' MB');
console.log('══════════════════════════════════════');

db.close();
console.log('');
console.log('完成！数据库已保存到 data/学科词库.db');
