const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, '..', 'data', '同物异名.db'));

// 抽查新插入的关键术语
const checks = ['概念抗体','产业后备军','看门狗型','造血型','系统1','系统2','认知偏差',
  '数字孪生','模型监控','AI治理','数据血缘','蝴蝶效应','新话','概念网络','无用阶级',
  '狗屁工作','情感劳动','奶头乐','独特知识','沉没成本谬误','达克效应','塔西佗陷阱',
  '四步升维法','元技能','黑箱审计','范围蔓延','算力调度','算力成本'];

console.log('=== 抽查新术语 ===');
for (const name of checks) {
  const row = db.prepare('SELECT 词条ID, 学科, 名称, 翻译 FROM 词条 WHERE 名称 = ?').get(name);
  if (row) {
    console.log(`  ✓ ${row.词条ID} [${row.学科}] ${row.名称} (${row.翻译})`);
  } else {
    console.log(`  ✗ ${name} 未找到!`);
  }
}

// 检查重复ID
const dupes = db.prepare(`SELECT 词条ID, COUNT(*) as cnt FROM 词条 GROUP BY 词条ID HAVING cnt > 1`).all();
console.log(`\n重复ID: ${dupes.length === 0 ? '无' : dupes.map(d => d.词条ID).join(', ')}`);

// 总数
const total = db.prepare('SELECT COUNT(*) as cnt FROM 词条').get();
console.log(`总词条数: ${total.cnt}`);

db.close();
