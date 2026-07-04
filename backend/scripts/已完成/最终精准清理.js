/**
 * 最终精准清理 - 第四轮
 * 策略：对污染严重的表，删除权重1且5字以上的条目（大概率是诗句/杂项）
 * 保留短条目（2-4字）—— 即使是权重1，短条目更可能是术语/成语
 * 同时清理其他表的残留地名
 */
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', '..', 'data', '学科词库.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

const tables = db.prepare(
  "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
).all().map(r => r.name);

let totalDeleted = 0;
const stats = {};

for (const table of tables) {
  const before = db.prepare('SELECT COUNT(*) as c FROM "' + table + '"').get().c;
  let deleted = 0;

  // 1. 权重1 + 5字以上 → 大概率非术语
  const r1 = db.prepare('DELETE FROM "' + table + '" WHERE 权重 = 1 AND length(词语) >= 5').run();
  deleted += r1.changes;

  // 2. 权重2 + 7字以上 → 长短语，大概率非术语
  const r2 = db.prepare('DELETE FROM "' + table + '" WHERE 权重 = 2 AND length(词语) >= 7').run();
  deleted += r2.changes;

  // 3. 补充地名清理：X村/X社区（3-5字，权重<=2）
  const placeRows = db.prepare(
    'SELECT id, 词语 FROM "' + table + '" WHERE length(词语) BETWEEN 3 AND 5 AND 权重 <= 2'
  ).all();
  const placeIds = [];
  for (const r of placeRows) {
    const w = r.词语;
    if (w.endsWith('村') || w.endsWith('社区') || w.endsWith('居委会')) {
      placeIds.push(r.id);
    }
  }
  if (placeIds.length > 0) {
    const delStmt = db.prepare('DELETE FROM "' + table + '" WHERE id = ?');
    const tx = db.transaction((ids) => {
      let d = 0;
      for (const id of ids) { d += delStmt.run(id).changes; }
      return d;
    });
    deleted += tx(placeIds);
  }

  const after = db.prepare('SELECT COUNT(*) as c FROM "' + table + '"').get().c;
  const actualDeleted = before - after;

  if (actualDeleted > 0) {
    stats[table] = { before, after, deleted: actualDeleted };
    totalDeleted += actualDeleted;
  }
}

// ── 输出结果 ──
console.log('=== 最终精准清理结果 ===\n');
for (const [t, s] of Object.entries(stats)) {
  console.log('【' + t + '】' + s.before.toLocaleString() + ' → ' + s.after.toLocaleString() + '（删除 ' + s.deleted.toLocaleString() + '）');
}
console.log('\n总计删除: ' + totalDeleted.toLocaleString() + ' 条');

// VACUUM
console.log('\n正在 VACUUM...');
db.exec('VACUUM');

const dbSize = fs.statSync(DB_PATH).size;
console.log('数据库大小: ' + (dbSize / 1024 / 1024).toFixed(1) + ' MB');

// 最终统计
console.log('\n=== 最终各表数据量 ===');
let grandTotal = 0;
for (const t of tables) {
  const c = db.prepare('SELECT COUNT(*) as c FROM "' + t + '"').get().c;
  grandTotal += c;
  console.log('  ' + t + ': ' + c.toLocaleString());
}
console.log('总计: ' + grandTotal.toLocaleString() + ' 条');

db.close();
