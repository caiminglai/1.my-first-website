const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const db = new Database(path.join('..', 'data', '同物异名.db'));

// 备份
db.exec('PRAGMA wal_checkpoint(TRUNCATE)');

const insert = db.prepare('INSERT OR IGNORE INTO 词条 (词条ID, 学科, 名称, 翻译, 本质, 提示, 跨学科别名, 热度) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');

// 加载所有数据文件
const data = [];
const dataDir = 'C:\\Users\\Lcm\\.qoderworkcn\\workspace\\mqzafl2t29x6wiwd';
const files = [
  'data_经济学.js',
  'data_数学.js',
  'data_计算机.js',
  'data_跨学科.js',
  'data_物理补充.js',
  'data_医学心理.js',
  'data_法律政策.js',
  'data_控制论.js',
  'data_化学.js',
  'data_生物学.js'
];

for (const f of files) {
  const fp = path.join(dataDir, f);
  if (!fs.existsSync(fp)) {
    console.log('文件不存在，跳过: ' + f);
    continue;
  }
  const content = fs.readFileSync(fp, 'utf-8');
  // 用 eval 执行 data.push 调用
  try {
    eval(content);
    console.log('加载: ' + f + ' (当前data长度: ' + data.length + ')');
  } catch (e) {
    console.log('解析失败: ' + f + ' -> ' + e.message);
    // 尝试显示前200字符帮助调试
    console.log('文件前200字符: ' + content.substring(0, 200));
  }
}

console.log('\n总计加载 ' + data.length + ' 条待入库');

// 检查ID冲突
const existingIds = new Set();
const existing = db.prepare('SELECT 词条ID FROM 词条').all();
existing.forEach(r => existingIds.add(r.词条ID));

const newEntries = [];
const skipped = [];
for (const e of data) {
  if (existingIds.has(e.id)) {
    skipped.push(e.id + ':' + e.name);
  } else {
    newEntries.push(e);
    existingIds.add(e.id); // 防止批次内重复
  }
}

if (skipped.length > 0) {
  console.log('\n跳过已存在的ID (' + skipped.length + '条): ' + skipped.slice(0, 10).join(', ') + (skipped.length > 10 ? '...' : ''));
}

// 批量插入
const batchInsert = db.transaction((entries) => {
  let count = 0;
  for (const e of entries) {
    const result = insert.run(e.id, e.disc, e.name, e.trans, e.essence, e.hint, e.aliases || '[]', e.hot || 0);
    if (result.changes > 0) count++;
  }
  return count;
});

const inserted = batchInsert(newEntries);
console.log('\n成功插入 ' + inserted + ' 条词条');

// 显示最终统计
console.log('\n=== 最终各学科词条数 ===');
const counts = db.prepare('SELECT 学科, COUNT(*) as cnt FROM 词条 GROUP BY 学科 ORDER BY cnt DESC').all();
let total = 0;
counts.forEach(r => {
  console.log('  ' + r.学科 + ': ' + r.cnt);
  total += r.cnt;
});
console.log('总计: ' + total);

// 检查数据质量
const empty = db.prepare("SELECT COUNT(*) as cnt FROM 词条 WHERE 翻译='' OR 本质='' OR 提示=''").get();
console.log('\n数据质量: ' + (empty.cnt === 0 ? '通过(无空字段)' : empty.cnt + '条有空白字段'));

const dupes = db.prepare('SELECT 词条ID, COUNT(*) as cnt FROM 词条 GROUP BY 词条ID HAVING cnt > 1').all();
console.log('重复ID: ' + (dupes.length === 0 ? '无' : JSON.stringify(dupes)));
