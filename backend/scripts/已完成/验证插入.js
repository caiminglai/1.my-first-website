const Database = require('better-sqlite3');
const db = new Database('../data/同物异名.db');

// 检查重复ID
const dups = db.prepare('SELECT 词条ID, COUNT(*) as cnt FROM 词条 GROUP BY 词条ID HAVING cnt > 1').all();
console.log('重复ID数量:', dups.length);
if (dups.length > 0) {
  console.log('重复详情:', JSON.stringify(dups.slice(0, 20)));
}

// 各学科ID范围
const stats = db.prepare('SELECT 学科, MIN(词条ID) as min_id, MAX(词条ID) as max_id, COUNT(*) as cnt FROM 词条 GROUP BY 学科 ORDER BY cnt DESC').all();
console.log('\n各学科ID范围:');
stats.forEach(s => console.log(`  ${s.学科}: ${s.cnt}条, ID: ${s.min_id} ~ ${s.max_id}`));

// 检查新插入的术语是否存在
const newTerms = ['酸碱反应', '彩虹', '递归', '噪声', '激素', '变分法', '厄尔尼诺'];
console.log('\n抽查新术语:');
for (const t of newTerms) {
  const row = db.prepare('SELECT 词条ID, 学科, 名称, 翻译 FROM 词条 WHERE 名称 = ?').get(t);
  if (row) console.log(`  ✓ ${row.词条ID} | ${row.学科} | ${row.名称} ↔ ${row.翻译}`);
  else console.log(`  ✗ ${t} 未找到`);
}

db.close();
