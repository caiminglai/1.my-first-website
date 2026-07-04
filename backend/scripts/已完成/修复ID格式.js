const Database = require('better-sqlite3');
const db = new Database('../data/同物异名.db');

// 需要修复的学科前缀
const prefixMap = {
  '化学': 'ch',
  '物理学': 'p',
  '跨学科': 'x',
  '计算机': 'c',
  '控制论': 'b',
  '医学心理': 'd',
  '数学': 'm'
};

let fixed = 0;

for (const [disc, prefix] of Object.entries(prefixMap)) {
  // 查找该学科下所有短ID（1-2位数字）
  const shortIds = db.prepare(
    `SELECT 词条ID, 名称 FROM 词条 WHERE 学科 = ? AND 词条ID GLOB ?`
  ).all(disc, prefix + '[0-9]');

  // 也查两位数字的
  const shortIds2 = db.prepare(
    `SELECT 词条ID, 名称 FROM 词条 WHERE 学科 = ? AND 词条ID GLOB ?`
  ).all(disc, prefix + '[0-9][0-9]');

  const allShort = [...shortIds, ...shortIds2];

  for (const row of allShort) {
    const num = parseInt(row.词条ID.slice(prefix.length));
    const newId = prefix + String(num).padStart(3, '0');

    // 检查新ID是否已存在
    const exists = db.prepare('SELECT 1 FROM 词条 WHERE 词条ID = ?').get(newId);
    if (exists) {
      console.log(`⚠ ${newId} 已存在，跳过 ${row.名称}`);
      continue;
    }

    db.prepare('UPDATE 词条 SET 词条ID = ? WHERE 词条ID = ?').run(newId, row.词条ID);
    console.log(`  ${row.词条ID} → ${newId} | ${row.名称}`);
    fixed++;
  }
}

console.log(`\n✅ 修复了 ${fixed} 条ID格式`);

// 验证
const stats = db.prepare('SELECT 学科, MIN(词条ID) as min_id, MAX(词条ID) as max_id, COUNT(*) as cnt FROM 词条 GROUP BY 学科 ORDER BY cnt DESC').all();
console.log('\n修复后各学科ID范围:');
stats.forEach(s => console.log(`  ${s.学科}: ${s.cnt}条, ID: ${s.min_id} ~ ${s.max_id}`));

db.close();
