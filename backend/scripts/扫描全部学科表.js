/**
 * 全面扫描学科词库.db 24张表，分析数据质量
 */
const Database = require('better-sqlite3');
const db = new Database('E:/website/1.my-first-website/data/学科词库.db', { readonly: true });

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
  '党','贡','劳','姬','扶','堵','冉','宰','雍','璩','桑','濮','寿','通','边',
  '','燕','冀','浦','尚','农','别','晏','柴','瞿','阎','充','慕','连','茹','习',
  '宦','艾','鱼','容','古','慎','戈','庾','终','暨','衡','步','都','满','弘','匡',
  '国','寇','广','禄','阙','东','殳','沃','利','蔚','越','夔','隆','师','巩','晁',
  '勾','敖','融','冷','阚','那','简','饶','空','毋','沙','乜','养','鞠','须','巢',
  '蒯','相','后','荆','红','竺','权','盖','桓','公','法','汝','钦','商','佘',
  '伯','赏','墨','哈','年','爱','佟','言','福','晋','楚','闫'
];

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all().map(r => r.name);

console.log('共 ' + tables.length + ' 张表\n');

let grandTotal = 0;
let grandIssues = 0;

for (const table of tables) {
  const total = db.prepare(`SELECT COUNT(*) as c FROM "${table}"`).get().c;
  grandTotal += total;

  // 1. 大学校名
  const universities = db.prepare(`SELECT COUNT(*) as c FROM "${table}" WHERE 词语 LIKE '%大学' OR 词语 LIKE '%学院'`).get().c;
  
  // 2. 期刊杂志
  const journals = db.prepare(`SELECT COUNT(*) as c FROM "${table}" WHERE 词语 LIKE '%杂志' OR 词语 LIKE '%学报' OR 词语 LIKE '%期刊' OR 词语 LIKE '%日报' OR 词语 LIKE '%周刊' OR 词语 LIKE '%通讯社'`).get().c;
  
  // 3. 纯数字
  const numbers = db.prepare(`SELECT COUNT(*) as c FROM "${table}" WHERE 词语 GLOB '[0-9]' OR 词语 GLOB '[0-9][0-9]' OR 词语 GLOB '[0-9][0-9][0-9]' OR 词语 GLOB '[0-9][0-9][0-9][0-9]'`).get().c;
  
  // 4. 企业名
  const companies = db.prepare(`SELECT COUNT(*) as c FROM "${table}" WHERE 词语 LIKE '%有限公司' OR 词语 LIKE '%集团%' OR 词语 LIKE '%股份公司%' OR 词语 LIKE '%事务所%'`).get().c;

  // 5. 培训广告
  const ads = db.prepare(`SELECT COUNT(*) as c FROM "${table}" WHERE 词语 LIKE '%培训%' OR 词语 LIKE '%考研%' OR 词语 LIKE '%网校%' OR 词语 LIKE '%辅导%'`).get().c;

  // 6. 人名（2-3字常见姓+低权重）
  let persons = 0;
  for (const s of SURNAMES) {
    const c = db.prepare(`SELECT COUNT(*) as c FROM "${table}" WHERE length(词语) BETWEEN 2 AND 3 AND 词语 LIKE ? AND 权重 < 6`).get(s + '%').c;
    persons += c;
  }

  // 7. 含英文字母
  const english = db.prepare(`SELECT COUNT(*) as c FROM "${table}" WHERE 词语 GLOB '*[a-zA-Z]*'`).get().c;

  // 8. 超长短语（8字以上，可能是句子）
  const longPhrases = db.prepare(`SELECT COUNT(*) as c FROM "${table}" WHERE length(词语) >= 8`).get().c;

  // 9. 古诗文（5-7字含文言虚词）
  const classical = db.prepare(`SELECT COUNT(*) as c FROM "${table}" WHERE length(词语) BETWEEN 5 AND 7 AND (词语 LIKE '%之%' OR 词语 LIKE '%乎%' OR 词语 LIKE '%者%' OR 词语 LIKE '%也%' OR 词语 LIKE '%矣%' OR 词语 LIKE '%焉%' OR 词语 LIKE '%哉%' OR 词语 LIKE '%兮%' OR 词语 LIKE '%见%如%' OR 词语 LIKE '%每日里%')`).get().c;

  const issues = universities + journals + numbers + companies + ads + persons + english + longPhrases + classical;
  grandIssues += issues;

  const issueRate = ((issues / total) * 100).toFixed(1);

  console.log('【' + table + '】共 ' + total + ' 条 | 问题约 ' + issues + ' 条 (' + issueRate + '%)');
  if (universities > 0) console.log('  院校名: ' + universities);
  if (journals > 0) console.log('  期刊杂志: ' + journals);
  if (numbers > 0) console.log('  纯数字: ' + numbers);
  if (companies > 0) console.log('  企业名: ' + companies);
  if (ads > 0) console.log('  培训广告: ' + ads);
  if (persons > 0) console.log('  人名: ' + persons);
  if (english > 0) console.log('  含英文: ' + english);
  if (longPhrases > 0) console.log('  超长短语(8字+): ' + longPhrases);
  if (classical > 0) console.log('  古诗文: ' + classical);
  console.log('');
}

console.log('====================');
console.log('全部24表总计: ' + grandTotal + ' 条');
console.log('问题数据总计约: ' + grandIssues + ' 条 (' + ((grandIssues/grandTotal)*100).toFixed(1) + '%)');

// 额外：看几张典型表的随机抽样
console.log('\n\n=== 各表随机抽样（每张5条，看数据质量）===\n');
const sampleTables = ['数学科学','物理科学','化学化工','动植生物','医药医学','计算机业','金融财经','法律诉讼','管理科学','社会科学','机械工程','电子工程','通信工程','汉语言学','世界哲学','世界宗教','土木工程','钢铁冶金','水利工程','矿业勘探','船舶工程','安全工程','敏感用词'];

for (const table of sampleTables) {
  if (!tables.includes(table)) continue;
  console.log('【' + table + '】随机5条:');
  const rows = db.prepare(`SELECT 词语, 权重 FROM "${table}" ORDER BY RANDOM() LIMIT 5`).all();
  rows.forEach(r => console.log('  ' + r.词语 + ' (权重' + r.权重 + ')'));
  console.log('');
}

db.close();
