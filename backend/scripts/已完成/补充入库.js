const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const db = new Database(path.join('..', 'data', '同物异名.db'));

const dataDir = 'C:\\Users\\Lcm\\.qoderworkcn\\workspace\\mqzafl2t29x6wiwd';

function convertAndInsert(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  // 提取 JSON 数组部分：找到第一个 [ 到最后一个 ]
  const startIdx = content.indexOf('[');
  const endIdx = content.lastIndexOf(']');
  if (startIdx === -1 || endIdx === -1) {
    console.log('无法找到数组: ' + filePath);
    return 0;
  }
  const arrayStr = content.substring(startIdx, endIdx + 1);

  // 解析对象数组
  let items;
  try {
    items = eval(arrayStr);
  } catch(e) {
    console.log('解析失败: ' + filePath + ' -> ' + e.message);
    return 0;
  }

  console.log('解析到 ' + items.length + ' 条: ' + path.basename(filePath));

  // 检查已有ID
  const existingIds = new Set();
  const existing = db.prepare('SELECT 词条ID FROM 词条').all();
  existing.forEach(r => existingIds.add(r.词条ID));

  const insert = db.prepare('INSERT OR IGNORE INTO 词条 (词条ID, 学科, 名称, 翻译, 本质, 提示, 跨学科别名, 热度) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');

  const insertMany = db.transaction((items) => {
    let count = 0;
    for (const item of items) {
      const id = item.id;
      const disc = item.discipline || item.disc;
      const name = item.name;
      const trans = item.translation || item.trans;
      const essence = item.essence;
      const hint = item.prompt || item.hint;
      const aliases = item.aliases || '[]';
      const heat = item.heat || item.hot || 0;

      if (!id || !disc || !name || !trans || !essence || !hint) {
        console.log('  跳过(缺字段): ' + JSON.stringify({id, disc, name}));
        continue;
      }

      if (existingIds.has(id)) {
        console.log('  跳过(已存在): ' + id + ' ' + name);
        continue;
      }

      const result = insert.run(id, disc, name, trans, essence, hint, aliases, heat);
      if (result.changes > 0) {
        count++;
        existingIds.add(id);
      }
    }
    return count;
  });

  return insertMany(items);
}

let total = 0;

// 处理跨学科
const crossFile = path.join(dataDir, 'data_跨学科.js');
if (fs.existsSync(crossFile)) {
  total += convertAndInsert(crossFile);
}

// 处理物理补充
const physFile = path.join(dataDir, 'data_物理补充.js');
if (fs.existsSync(physFile)) {
  total += convertAndInsert(physFile);
}

console.log('\n补充插入: ' + total + ' 条');

// 最终统计
console.log('\n=== 最终各学科词条数 ===');
const counts = db.prepare('SELECT 学科, COUNT(*) as cnt FROM 词条 GROUP BY 学科 ORDER BY cnt DESC').all();
let grand = 0;
counts.forEach(r => {
  console.log('  ' + r.学科 + ': ' + r.cnt);
  grand += r.cnt;
});
console.log('总计: ' + grand);

// 质量检查
const empty = db.prepare("SELECT COUNT(*) as cnt FROM 词条 WHERE 翻译='' OR 本质='' OR 提示=''").get();
console.log('\n数据质量: ' + (empty.cnt === 0 ? '通过(无空字段)' : empty.cnt + '条有空白字段'));

const dupes = db.prepare('SELECT 词条ID, COUNT(*) as cnt FROM 词条 GROUP BY 词条ID HAVING cnt > 1').all();
console.log('重复ID: ' + (dupes.length === 0 ? '无' : JSON.stringify(dupes)));
