/**
 * 精准清理 - 第二轮
 * 针对第一轮清理后残留的问题数据：
 * 1. 以"的"结尾的描述性短语
 * 2. 含标点符号的列表型条目
 * 3. 8字以上超长短语
 * 4. 古诗文句子（文言虚词检测）
 * 5. 具体大学/出版社名称
 * 6. 地名/街道名（大学路街道等）
 */
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'data', '学科词库.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

const tables = db.prepare(
  "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
).all().map(r => r.name);

// ── 具体大学名单（用于匹配出版社/医学部等具体机构） ──
const SPECIFIC_UNIS = [
  '北京大学', '清华大学', '复旦大学', '上海交通大学', '浙江大学',
  '南京大学', '南开大学', '天津大学', '同济大学', '武汉大学',
  '中山大学', '四川大学', '山东大学', '湖南大学', '中北大学',
  '中南大学', '华东师范', '华南理工', '大连理工', '东南大学',
  '厦门大学', '吉林大学', '东北大学', '兰州大学', '西北大学',
  '西安交通', '哈尔滨工业', '北京航空', '北京理工', '中国人民',
  '南京大学', '南京航空', '南京理工',
];

// ── 文言虚词（古诗文检测） ──
const CLASSICAL_PARTICLES = /[之乎者也矣焉哉兮矣焉哉]/;

let totalDeleted = 0;
const stats = {};

for (const table of tables) {
  const before = db.prepare('SELECT COUNT(*) as c FROM "' + table + '"').get().c;
  let deleted = 0;

  // 1. 以"的"结尾 → 描述性短语
  //    排除：经营目的、的确、的士 等"的"是词根的情况
  const r1 = db.prepare('DELETE FROM "' + table + '" WHERE 词语 LIKE ? AND length(词语) >= 3').run('%的');
  deleted += r1.changes;

  // 2. 含标点符号 → 列表型条目
  const r2 = db.prepare('DELETE FROM "' + table + '" WHERE 词语 LIKE ? OR 词语 LIKE ? OR 词语 LIKE ? OR 词语 LIKE ? OR 词语 LIKE ?').run('%，%', '%。%', '%、%', '%；%', '%！%');
  deleted += r2.changes;
  // 还有英文逗号和感叹号
  const r2b = db.prepare('DELETE FROM "' + table + '" WHERE 词语 LIKE ? OR 词语 LIKE ?').run('%,%', '%!%');
  deleted += r2b.changes;

  // 3. 8字以上超长短语
  const r3 = db.prepare('DELETE FROM "' + table + '" WHERE length(词语) >= 8').run();
  deleted += r3.changes;

  // 4. 古诗文：5-7字 且含文言虚词
  const allMid = db.prepare('SELECT id, 词语 FROM "' + table + '" WHERE length(词语) BETWEEN 5 AND 7').all();
  const poetryIds = [];
  for (const r of allMid) {
    if (CLASSICAL_PARTICLES.test(r.词语)) {
      poetryIds.push(r.id);
    }
  }
  if (poetryIds.length > 0) {
    const delPoetry = db.prepare('DELETE FROM "' + table + '" WHERE id = ?');
    const tx = db.transaction((ids) => {
      let d = 0;
      for (const id of ids) { d += delPoetry.run(id).changes; }
      return d;
    });
    deleted += tx(poetryIds);
  }

  // 5. 具体大学+出版社/医学部/校友桥 等
  for (const uni of SPECIFIC_UNIS) {
    const r = db.prepare('DELETE FROM "' + table + '" WHERE 词语 LIKE ?').run(uni + '%');
    deleted += r.changes;
  }

  // 6. 地名/街道名模式
  const r6a = db.prepare('DELETE FROM "' + table + '" WHERE 词语 LIKE ? AND 词语 LIKE ?').run('%大学%', '%街道%');
  deleted += r6a.changes;
  const r6b = db.prepare('DELETE FROM "' + table + '" WHERE 词语 LIKE ? AND 词语 LIKE ?').run('%学院%', '%街道%');
  deleted += r6b.changes;
  // 学院胡同、学院街 等
  const r6c = db.prepare('DELETE FROM "' + table + '" WHERE (词语 LIKE ? OR 词语 LIKE ?) AND (词语 LIKE ? OR 词语 LIKE ? OR 词语 LIKE ?)').run('%学院%', '%大学%', '%胡同%', '%街%', '%大厦%');
  deleted += r6c.changes;
  // 大学城公寓/大学路公寓 等地名
  const r6d = db.prepare('DELETE FROM "' + table + '" WHERE 词语 LIKE ? OR 词语 LIKE ? OR 词语 LIKE ? OR 词语 LIKE ?').run('%大学城%', '%大学路%', '%学院路%', '%学院南路%');
  deleted += r6d.changes;

  // 7. 补充：含"站"的地名（水利学院站等）
  const r7 = db.prepare('DELETE FROM "' + table + '" WHERE (词语 LIKE ? OR 词语 LIKE ?) AND 词语 LIKE ?').run('%学院%', '%大学%', '%站');
  deleted += r7.changes;

  const after = db.prepare('SELECT COUNT(*) as c FROM "' + table + '"').get().c;
  const actualDeleted = before - after;

  if (actualDeleted > 0) {
    stats[table] = { before, after, deleted: actualDeleted };
    totalDeleted += actualDeleted;
  }
}

// ── 输出结果 ──
console.log('=== 精准清理结果 ===\n');
for (const [t, s] of Object.entries(stats)) {
  console.log('【' + t + '】' + s.before.toLocaleString() + ' → ' + s.after.toLocaleString() + '（删除 ' + s.deleted.toLocaleString() + '）');
}
console.log('\n总计删除: ' + totalDeleted.toLocaleString() + ' 条');

// VACUUM
console.log('\n正在 VACUUM...');
db.exec('VACUUM');

const fs = require('fs');
const dbSize = fs.statSync(DB_PATH).size;
console.log('数据库大小: ' + (dbSize / 1024 / 1024).toFixed(1) + ' MB');

// 最终统计
console.log('\n=== 清理后各表数据量 ===');
let grandTotal = 0;
for (const t of tables) {
  const c = db.prepare('SELECT COUNT(*) as c FROM "' + t + '"').get().c;
  grandTotal += c;
}
console.log('总计: ' + grandTotal.toLocaleString() + ' 条');

db.close();
