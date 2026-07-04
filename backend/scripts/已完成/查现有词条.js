const path = require('path');
const Database = require('better-sqlite3');
const db = new Database(path.join('..', 'data', '同物异名.db'));

const subjects = ['经济学','数学','跨学科','计算机','医学心理','法律政策','化学','生物学','控制论','物理学'];
for (const s of subjects) {
  const rows = db.prepare('SELECT 词条ID, 名称 FROM 词条 WHERE 学科=? ORDER BY 词条ID').all(s);
  console.log('\n=== ' + s + ' (' + rows.length + '条) ===');
  console.log(rows.map(r => r.词条ID + ':' + r.名称).join(', '));
}
