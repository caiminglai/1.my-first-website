const { initDB, getDb } = require('./入口');
initDB();
const db = getDb();

// 19个词库表 → 10个核心学科 的映射
const 词库映射 = {
  '数学科学': '数学',
  '物理科学': '物理学',
  '化学化工': '化学',
  '钢铁冶金': '化学',
  '医药医学': '医学心理',
  '计算机业': '计算机',
  '电子工程': '计算机',
  '通信工程': '计算机',
  '金融财经': '经济学',
  '管理科学': '经济学',
  '法律诉讼': '法律政策',
  '机械工程': '跨学科',
  '土木工程': '跨学科',
  '船舶工程': '跨学科',
  '矿业勘探': '跨学科',
  '水利工程': '跨学科',
  '社会科学': '跨学科',
  '世界哲学': '跨学科',
  '教育教学': '跨学科'
};

// 创学科子领域映射表
db.exec(`
  CREATE TABLE IF NOT EXISTS 学科子领域映射 (
    子领域名称 TEXT PRIMARY KEY,
    核心学科 TEXT NOT NULL,
    词条数量 INTEGER DEFAULT 0,
    显示顺序 INTEGER DEFAULT 99,
    描述 TEXT DEFAULT '',
    创建时间 DATETIME DEFAULT CURRENT_TIMESTAMP,
    更新时间 DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);
console.log('学科子领域映射表已创建');

// 插入初始映射数据
const stmt = db.prepare(`
  INSERT OR REPLACE INTO 学科子领域映射 (子领域名称, 核心学科, 词条数量, 显示顺序, 描述)
  VALUES (?, ?, ?, ?, ?)
`);

let order = 1;
for (const [子领域, 核心学科] of Object.entries(词库映射)) {
  try {
    const count = db.prepare(`SELECT COUNT(*) as cnt FROM "${子领域}"`).get()?.cnt || 0;
    stmt.run(子领域, 核心学科, count, order, `${子领域}词库，归属${核心学科}`);
    order++;
  } catch(e) {
    console.log(`  跳过 ${子领域}: ${e.message}`);
  }
}
console.log('初始映射数据已插入');

// 验证
const result = db.prepare('SELECT 核心学科, COUNT(*) as 子领域数, SUM(词条数量) as 总词条数 FROM 学科子领域映射 GROUP BY 核心学科 ORDER BY 总词条数 DESC').all();
console.log('\n=== 融合后各核心学科词条数 ===\n');
result.forEach(r => {
  console.log(`${r.核心学科}: ${r.子领域数}个子领域, ${r.总词条数}条词条`);
});

console.log('\n完成！');
