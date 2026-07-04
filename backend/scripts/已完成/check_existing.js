const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join('E:', 'website', '1.my-first-website', 'data', '同物异名.db');
const db = new Database(dbPath, { readonly: true });

// Get schema
const info = db.prepare("PRAGMA table_info(词条)").all();
console.log('Columns:', info.map(c => c.name).join(', '));

// Get existing 控制论 terms
const rows = db.prepare('SELECT * FROM 词条 WHERE 学科 = ?').all('控制论');
console.log('\nExisting 控制论 terms (' + rows.length + '):');
for (const row of rows) {
  console.log(`  ${row.名称} | trans: ${row.通俗翻译 || 'N/A'} | hint: ${row.一句话 || 'N/A'}`);
}
db.close();
