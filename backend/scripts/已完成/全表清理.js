/**
 * 全表智能清理 — 学科词库.db 24张表
 */
const Database = require('better-sqlite3');
const db = new Database('E:/website/1.my-first-website/data/学科词库.db');

const SURNAMES = [
  '王','李','张','刘','陈','杨','赵','黄','周','吴','徐','孙','马','朱','胡','郭',
  '何','高','林','罗','郑','梁','谢','宋','唐','许','韩','冯','邓','曹','彭','曾',
  '萧','田','董','袁','潘','于','蒋','蔡','余','杜','叶','程','苏','魏','吕','丁',
  '任','沈','姚','卢','姜','崔','钟','谭','陆','汪','范','金','石','廖','贾','夏',
  '韦','傅','方','白','邹','孟','熊','秦','邱','邵','江','史','顾','侯','龙','万',
  '段','雷','钱','汤','尹','黎','易','常','武','乔','贺','赖','龚','文','庞','樊',
  '兰','殷','施','陶','洪','翟','安','颜','倪','严','牛','温','芦','季','俞','章',
  '鲁','葛','伍','申','尤','毕','聂','丛','焦','向','柳','邢','路','岳','齐','康',
  '梅','莫','庄','辛','管','祝','左','涂','谷','祁','时','舒','耿','牟','卜','詹',
  '关','苗','凌','费','纪','靳','盛','童','欧','甄','项','曲','成','游','阳','裴',
  '席','卫','查','屈','鲍','位','覃','霍','翁','隋','植','甘','景','薄','单','包',
  '司','柏','宁','柯','阮','桂','闵','解','应','宗','宣','郁','杭','诸','吉','钮',
  '嵇','滑','荣','荀','羊','於','惠','封','芮','羿','储','汲','松','井','富','巫',
  '乌','巴','弓','牧','宓','蓬','全','郗','班','仰','秋','仲','伊','宫','仇',
  '栾','暴','钭','厉','戎','祖','符','束','幸','韶','郜','印','宿','怀','蒲','邰',
  '从','鄂','索','咸','籍','卓','','屠','蒙','池','阴','能','苍','双','闻','莘',
  '党','贡','劳','姬','扶','堵','冉','宰','雍','','桑','濮','寿','通','边',
  '','燕','冀','浦','尚','农','别','晏','柴','瞿','阎','充','慕','连','茹','习',
  '宦','艾','鱼','容','古','慎','戈','庾','终','暨','衡','步','都','满','弘','匡',
  '国','寇','广','禄','阙','东','殳','沃','利','蔚','越','夔','隆','师','巩','',
  '勾','敖','融','冷','阚','那','简','饶','空','毋','沙','乜','养','鞠','须','巢',
  '蒯','相','后','荆','红','竺','权','盖','桓','公','法','汝','钦','商','',
  '伯','赏','墨','哈','年','爱','佟','言','福','晋','楚','闫'
];

const COMPOUND_SURNAMES = [
  '司马','上官','欧阳','夏侯','诸葛','闻人','东方','赫连','皇甫','尉迟','公羊',
  '澹台','公冶','宗政','濮阳','淳于','单于','太叔','申屠','公孙','仲孙','轩辕',
  '令狐','钟离','宇文','长孙','慕容','鲜于','闾丘','司徒','司空','官','司寇',
  '子车','颛孙','端木','巫马','公西','漆雕','乐正','壤驷','公良','拓跋','夹谷',
  '宰父','谷梁','万俟','第五'
];

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all().map(r => r.name);

console.log('共 ' + tables.length + ' 张表，开始全表清理\n');

let totalDeleted = 0;

function runDel(table, label, sql, params = []) {
  const before = db.prepare(`SELECT COUNT(*) as c FROM "${table}"`).get().c;
  const info = db.prepare(sql).run(...params);
  const after = db.prepare(`SELECT COUNT(*) as c FROM "${table}"`).get().c;
  const d = before - after;
  if (d > 0) console.log(`  [${table}] ${label}: -${d}`);
  return d;
}

for (const table of tables) {
  console.log('【' + table + '】');
  let tableDeleted = 0;

  // 1. 大学校名
  tableDeleted += runDel(table, '大学校名', `DELETE FROM "${table}" WHERE 词语 LIKE '%大学'`);

  // 2. 学院校名（保留学院派、学院奖）
  tableDeleted += runDel(table, '学院校名', `DELETE FROM "${table}" WHERE 词语 LIKE '%学院' AND 词语 NOT IN ('学院派','学院奖')`);

  // 3. 期刊杂志
  tableDeleted += runDel(table, '期刊杂志', `DELETE FROM "${table}" WHERE 词语 LIKE '%杂志' OR 词语 LIKE '%学报' OR 词语 LIKE '%期刊' OR 词语 LIKE '%日报' OR 词语 LIKE '%周刊' OR 词语 LIKE '%通讯社' OR 词语 LIKE '%画报'`);

  // 4. 纯数字
  tableDeleted += runDel(table, '纯数字', `DELETE FROM "${table}" WHERE 词语 GLOB '[0-9]' OR 词语 GLOB '[0-9][0-9]' OR 词语 GLOB '[0-9][0-9][0-9]' OR 词语 GLOB '[0-9][0-9][0-9][0-9]' OR 词语 GLOB '[0-9][0-9][0-9][0-9][0-9]' OR 词语 GLOB '[0-9][0-9][0-9][0-9][0-9][0-9]'`);

  // 5. 培训广告
  tableDeleted += runDel(table, '培训广告', `DELETE FROM "${table}" WHERE 词语 LIKE '%培训%' OR 词语 LIKE '%考研%' OR 词语 LIKE '%省考%' OR 词语 LIKE '%辅导%' OR 词语 LIKE '%网校%' OR 词语 LIKE '%教育科技%'`);

  // 6. 人名（2-3字常见姓+权重<6）
  let personDel = 0;
  const delPerson = db.prepare(`DELETE FROM "${table}" WHERE length(词语) BETWEEN 2 AND 3 AND 词语 LIKE ? AND 权重 < 6`);
  const delPersonTx = db.transaction((surnames) => {
    let d = 0;
    for (const s of surnames) { d += delPerson.run(s + '%').changes; }
    return d;
  });
  personDel = delPersonTx(SURNAMES);
  // 复姓 3-4字
  const delCompound = db.prepare(`DELETE FROM "${table}" WHERE length(词语) BETWEEN 3 AND 4 AND 词语 LIKE ? AND 权重 < 6`);
  for (const s of COMPOUND_SURNAMES) { personDel += delCompound.run(s + '%').changes; }
  if (personDel > 0) console.log(`  [${table}] 人名: -${personDel}`);
  tableDeleted += personDel;

  // 7. 企业名
  tableDeleted += runDel(table, '企业名', `DELETE FROM "${table}" WHERE 词语 LIKE '%有限公司' OR 词语 LIKE '%集团%' OR 词语 LIKE '%股份公司%' OR 词语 LIKE '%事务所%'`);

  // 8. 超长短语（8字以上，大概率不是术语）
  tableDeleted += runDel(table, '超长短语', `DELETE FROM "${table}" WHERE length(词语) >= 8`);

  // 9. 古诗文（5-7字含文言虚词）
  tableDeleted += runDel(table, '古诗文', `DELETE FROM "${table}" WHERE length(词语) BETWEEN 5 AND 7 AND (词语 LIKE '%之%' OR 词语 LIKE '%乎%' OR 词语 LIKE '%者%' OR 词语 LIKE '%也%' OR 词语 LIKE '%矣%' OR 词语 LIKE '%焉%' OR 词语 LIKE '%哉%' OR 词语 LIKE '%兮%' OR 词语 LIKE '%见%如%' OR 词语 LIKE '%每日里%')`);

  // 10. 含英文字母的短杂项（10字以内）
  tableDeleted += runDel(table, '英文杂项', `DELETE FROM "${table}" WHERE 词语 GLOB '*[a-zA-Z]*' AND length(词语) <= 10`);

  console.log(`  → 本表共删 ${tableDeleted} 条\n`);
  totalDeleted += tableDeleted;
}

const finalTotal = db.prepare("SELECT SUM(c) as total FROM (SELECT COUNT(*) as c FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%')").get();
let grandTotal = 0;
for (const t of tables) {
  grandTotal += db.prepare(`SELECT COUNT(*) as c FROM "${t}"`).get().c;
}

console.log('====================');
console.log('全表清理完成！');
console.log('共删除: ' + totalDeleted + ' 条');
console.log('剩余总数: ' + grandTotal + ' 条');

// VACUUM
console.log('\n执行 VACUUM 回收空间...');
db.exec('VACUUM');
const fs = require('fs');
const size = fs.statSync('E:/website/1.my-first-website/data/学科词库.db').size / 1024 / 1024;
console.log('数据库大小: ' + size.toFixed(1) + ' MB');

db.close();
console.log('\n完成！');
