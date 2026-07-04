/**
 * 智能清理教育教学表
 * 删除：大学院校、期刊杂志、纯数字、培训广告、人名、古诗文短语等
 */
const Database = require('better-sqlite3');
const db = new Database('E:/website/1.my-first-website/data/学科词库.db');

const TABLE = '教育教学';

// 常见百家姓（用于人名识别）
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
  '从','鄂','索','咸','籍','卓','蔺','屠','蒙','池','阴','能','苍','双','闻','莘',
  '党','贡','劳','姬','扶','堵','冉','宰','雍','璩','桑','濮','寿','通','边',
  '扈','燕','冀','浦','尚','农','别','晏','柴','瞿','阎','充','慕','连','茹','习',
  '宦','艾','鱼','容','古','慎','戈','庾','终','暨','衡','步','都','满','弘','匡',
  '国','寇','广','禄','阙','东','殳','沃','利','蔚','越','夔','隆','师','巩','晁',
  '勾','敖','融','冷','阚','那','简','饶','空','毋','沙','乜','养','鞠','须','巢',
  '蒯','相','后','荆','红','竺','权','盖','桓','公','法','汝','钦','商','佘',
  '伯','赏','墨','哈','年','爱','佟','言','福','晋','楚','闫'
];

// 复姓
const COMPOUND_SURNAMES = [
  '司马','上官','欧阳','夏侯','诸葛','闻人','东方','赫连','皇甫','尉迟','公羊',
  '澹台','公冶','宗政','濮阳','淳于','单于','太叔','申屠','公孙','仲孙','轩辕',
  '令狐','钟离','宇文','长孙','慕容','鲜于','闾丘','司徒','司空','亓官','司寇',
  '子车','颛孙','端木','巫马','公西','漆雕','乐正','壤驷','公良','拓跋','夹谷',
  '宰父','谷梁','万俟','第五'
];

function run(label, sql, params = []) {
  const before = db.prepare(`SELECT COUNT(*) as c FROM "${TABLE}"`).get().c;
  const info = db.prepare(sql).run(...params);
  const after = db.prepare(`SELECT COUNT(*) as c FROM "${TABLE}"`).get().c;
  const deleted = before - after;
  console.log(`[${label}] 删除 ${deleted} 条 (剩余 ${after})`);
  return deleted;
}

console.log('=== 教育教学表清理开始 ===');
console.log('清理前总数: ' + db.prepare(`SELECT COUNT(*) as c FROM "${TABLE}"`).get().c);
console.log('');

// 1. 大学校名（以"大学"结尾）
console.log('--- 第1批：大学校名 ---');
run('大学校名', `DELETE FROM "${TABLE}" WHERE 词语 LIKE '%大学'`);

// 2. 学院校名（以"学院"结尾，保留少数术语）
console.log('--- 第2批：学院校名 ---');
run('学院校名', `DELETE FROM "${TABLE}" WHERE 词语 LIKE '%学院' AND 词语 NOT IN ('学院派','学院奖')`);

// 3. 期刊/杂志/报纸/通讯社
console.log('--- 第3批：期刊杂志 ---');
run('期刊杂志', `DELETE FROM "${TABLE}" WHERE 词语 LIKE '%杂志' OR 词语 LIKE '%学报' OR 词语 LIKE '%期刊' OR 词语 LIKE '%日报' OR 词语 LIKE '%周刊' OR 词语 LIKE '%通讯社' OR 词语 LIKE '%画报'`);

// 4. 纯数字（1-6位）
console.log('--- 第4批：纯数字 ---');
run('纯数字', `DELETE FROM "${TABLE}" WHERE 词语 GLOB '[0-9]' OR 词语 GLOB '[0-9][0-9]' OR 词语 GLOB '[0-9][0-9][0-9]' OR 词语 GLOB '[0-9][0-9][0-9][0-9]' OR 词语 GLOB '[0-9][0-9][0-9][0-9][0-9]' OR 词语 GLOB '[0-9][0-9][0-9][0-9][0-9][0-9]'`);

// 5. 培训/广告/考试机构
console.log('--- 第5批：培训广告 ---');
run('培训广告', `DELETE FROM "${TABLE}" WHERE 词语 LIKE '%培训%' OR 词语 LIKE '%考研%' OR 词语 LIKE '%省考%' OR 词语 LIKE '%辅导%' OR 词语 LIKE '%网校%' OR 词语 LIKE '%教育科技%' OR 词语 LIKE '%培训中心%'`);

// 6. 人名（2-3字，常见姓开头，低权重的）
console.log('--- 第6批：人名 ---');
let personDeleted = 0;
for (const surname of SURNAMES) {
  const info = db.prepare(`DELETE FROM "${TABLE}" WHERE length(词语) BETWEEN 2 AND 3 AND 词语 LIKE ? AND 权重 < 6`).run(surname + '%');
  personDeleted += info.changes;
}
for (const surname of COMPOUND_SURNAMES) {
  const info = db.prepare(`DELETE FROM "${TABLE}" WHERE length(词语) BETWEEN 3 AND 4 AND 词语 LIKE ? AND 权重 < 6`).run(surname + '%');
  personDeleted += info.changes;
}
const afterPerson = db.prepare(`SELECT COUNT(*) as c FROM "${TABLE}"`).get().c;
console.log(`[人名] 删除 ${personDeleted} 条 (剩余 ${afterPerson})`);

// 7. 企业名
console.log('--- 第7批：企业名 ---');
run('企业名', `DELETE FROM "${TABLE}" WHERE 词语 LIKE '%有限公司' OR 词语 LIKE '%集团%' OR 词语 LIKE '%股份公司%' OR 词语 LIKE '%事务所%'`);

// 8. 漏网的地名院校
console.log('--- 第8批：地名院校残余 ---');
run('地名院校', `DELETE FROM "${TABLE}" WHERE 词语 LIKE '%师范大学' OR 词语 LIKE '%工业大学' OR 词语 LIKE '%理工大学' OR 词语 LIKE '%科技大学' OR 词语 LIKE '%农业大学' OR 词语 LIKE '%医科大学' OR 词语 LIKE '%财经大学' OR 词语 LIKE '%政法大学' OR 词语 LIKE '%职业技术学院' OR 词语 LIKE '%高等专科学校' OR 词语 LIKE '%师范学院'`);

// 9. 古诗文短语（5字以上含文言虚词，排除教育术语）
console.log('--- 第9批：古诗文短语 ---');
run('古诗文', `DELETE FROM "${TABLE}" WHERE length(词语) >= 5 AND (词语 LIKE '%之%' OR 词语 LIKE '%乎%' OR 词语 LIKE '%者%' OR 词语 LIKE '%也%' OR 词语 LIKE '%矣%' OR 词语 LIKE '%焉%' OR 词语 LIKE '%哉%' OR 词语 LIKE '%兮%' OR 词语 LIKE '%尔%' OR 词语 LIKE '%见%如%' OR 词语 LIKE '%每日里%') AND 词语 NOT LIKE '%教育%' AND 词语 NOT LIKE '%教学%' AND 词语 NOT LIKE '%课程%' AND 词语 NOT LIKE '%学习%' AND 词语 NOT LIKE '%考试%' AND 词语 NOT LIKE '%学校%' AND 词语 NOT LIKE '%学生%' AND 词语 NOT LIKE '%教师%' AND 词语 NOT LIKE '%管理%' AND 词语 NOT LIKE '%研究%' AND 词语 NOT LIKE '%发展%' AND 词语 NOT LIKE '%理论%' AND 词语 NOT LIKE '%方法%' AND 词语 NOT LIKE '%系统%' AND 词语 NOT LIKE '%分析%' AND 词语 NOT LIKE '%设计%' AND 词语 NOT LIKE '%评价%' AND 词语 NOT LIKE '%模式%' AND 词语 NOT LIKE '%策略%' AND 词语 NOT LIKE '%能力%' AND 词语 NOT LIKE '%知识%'`);

// 10. 含英文字母的短杂项
console.log('--- 第10批：英文杂项 ---');
run('英文杂项', `DELETE FROM "${TABLE}" WHERE 词语 GLOB '*[a-zA-Z]*' AND length(词语) <= 10`);

console.log('');
console.log('=== 清理完成 ===');
const final = db.prepare(`SELECT COUNT(*) as c FROM "${TABLE}"`).get().c;
console.log('最终剩余: ' + final + ' 条');

console.log('\n清理后权重最高的20条:');
const top = db.prepare(`SELECT 词语, 权重 FROM "${TABLE}" ORDER BY 权重 DESC LIMIT 20`).all();
top.forEach(r => console.log('  ' + r.词语 + ' (权重' + r.权重 + ')'));

console.log('\n随机抽样15条:');
const rand = db.prepare(`SELECT 词语, 权重 FROM "${TABLE}" ORDER BY RANDOM() LIMIT 15`).all();
rand.forEach(r => console.log('  ' + r.词语 + ' (权重' + r.权重 + ')'));

db.close();
console.log('\n完成！');
