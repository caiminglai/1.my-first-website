/**
 * 深度精准清理 - 第三轮
 * 针对第二轮后残留的：
 * 1. 古诗文句子（用句式特征检测，而非仅文言虚词）
 * 2. 地名/行政区划（乡/镇/街道/胡同/村/农场/林业局）
 * 3. 佛经/经文句子
 * 4. 报刊杂志名
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

// ── 古诗文句式特征词（含这些词+5字以上+低权重 → 大概率是诗句） ──
const POETRY_MARKERS = /[我你他她谁何已曾将欲更又亦皆犹自空徒漫休莫勿勿须应合当且方方乃即]/;
const POETRY_MARKERS2 = /[风雨雪花雪月云日春秋夜朝夕年月时分光影色彩声]/;
const POETRY_MARKERS3 = /[松柏柳梅兰竹菊荷雁燕龙凤鹤虎马牛羊鸡犬]/;

// ── 地名后缀 ──
const PLACE_SUFFIXES = ['乡', '镇', '街道', '胡同', '农场', '林业局', '林场', '牧场'];
const PLACE_PATTERNS = [
  '%乡', '%镇', '%胡同', '%农场', '%林场', '%牧场', '%林业局',
  '%新村%', '%花园%', '%小区%'
];

// ── 报刊/杂志/出版社后缀 ──
const MEDIA_SUFFIXES = ['报', '杂志', '通讯', '文学', '科技', '化纤', '建材'];

let totalDeleted = 0;
const stats = {};

for (const table of tables) {
  const before = db.prepare('SELECT COUNT(*) as c FROM "' + table + '"').get().c;
  let deleted = 0;

  // 1. 古诗文句子检测
  //    策略：5字以上 + 权重<=2 + 含诗句特征词
  //    分三轮用不同的特征词集，避免单轮漏检
  for (const pattern of [POETRY_MARKERS, POETRY_MARKERS2, POETRY_MARKERS3]) {
    const candidates = db.prepare(
      'SELECT id, 词语 FROM "' + table + '" WHERE length(词语) >= 5 AND 权重 <= 2'
    ).all();
    const ids = [];
    for (const r of candidates) {
      if (pattern.test(r.词语)) {
        ids.push(r.id);
      }
    }
    if (ids.length > 0) {
      const delStmt = db.prepare('DELETE FROM "' + table + '" WHERE id = ?');
      const tx = db.transaction((idList) => {
        let d = 0;
        for (const id of idList) { d += delStmt.run(id).changes; }
        return d;
      });
      deleted += tx(ids);
    }
  }

  // 2. 地名/行政区划
  // 乡/镇（X乡/X镇，3-5字，权重<=2）
  const placeRows = db.prepare(
    'SELECT id, 词语 FROM "' + table + '" WHERE length(词语) BETWEEN 3 AND 6 AND 权重 <= 2'
  ).all();
  const placeIds = [];
  for (const r of placeRows) {
    const w = r.词语;
    for (const suffix of PLACE_SUFFIXES) {
      if (w.endsWith(suffix)) {
        placeIds.push(r.id);
        break;
      }
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

  // 胡同（直接匹配）
  const r2hutong = db.prepare('DELETE FROM "' + table + '" WHERE 词语 LIKE ?').run('%胡同');
  deleted += r2hutong.changes;

  // 街道（X街道，3-5字）
  const r2street = db.prepare('DELETE FROM "' + table + '" WHERE 词语 LIKE ? AND length(词语) BETWEEN 3 AND 6').run('%街道');
  deleted += r2street.changes;

  // 3. 报刊杂志名（X报/X通讯/X文学 等，低权重）
  const mediaRows = db.prepare(
    'SELECT id, 词语 FROM "' + table + '" WHERE length(词语) BETWEEN 3 AND 6 AND 权重 <= 2'
  ).all();
  const mediaIds = [];
  for (const r of mediaRows) {
    const w = r.词语;
    for (const suffix of MEDIA_SUFFIXES) {
      if (w.endsWith(suffix)) {
        mediaIds.push(r.id);
        break;
      }
    }
  }
  if (mediaIds.length > 0) {
    const delStmt = db.prepare('DELETE FROM "' + table + '" WHERE id = ?');
    const tx = db.transaction((ids) => {
      let d = 0;
      for (const id of ids) { d += delStmt.run(id).changes; }
      return d;
    });
    deleted += tx(mediaIds);
  }

  // 4. 含"网""网站"的（中国课件网等）
  const r4 = db.prepare('DELETE FROM "' + table + '" WHERE (词语 LIKE ? OR 词语 LIKE ?) AND length(词语) >= 4 AND 权重 <= 2').run('%网', '%网站');
  deleted += r4.changes;

  const after = db.prepare('SELECT COUNT(*) as c FROM "' + table + '"').get().c;
  const actualDeleted = before - after;

  if (actualDeleted > 0) {
    stats[table] = { before, after, deleted: actualDeleted };
    totalDeleted += actualDeleted;
  }
}

// ── 输出结果 ──
console.log('=== 深度精准清理结果 ===\n');
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
console.log('\n=== 清理后各表数据量 ===');
let grandTotal = 0;
for (const t of tables) {
  const c = db.prepare('SELECT COUNT(*) as c FROM "' + t + '"').get().c;
  grandTotal += c;
  console.log('  ' + t + ': ' + c.toLocaleString());
}
console.log('总计: ' + grandTotal.toLocaleString() + ' 条');

db.close();
