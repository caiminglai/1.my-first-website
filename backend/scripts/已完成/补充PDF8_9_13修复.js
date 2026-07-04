const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'data', '同物异名.db'));

const fixTerms = [
  { 学科:'计算机', prefix:'c', 名称:'模型版本管理', 翻译:'Model versioning', 本质:'对AI模型的不同版本进行系统化管理，确保可回滚、可追溯、可复现', 提示:'大白话：模型改了要记录版本号，改坏了能退回去', 跨学科别名:'模型版本控制|ML版本管理|实验追踪' },
  { 学科:'计算机', prefix:'c', 名称:'算力调度', 翻译:'Compute scheduling', 本质:'在约束条件下对GPU/CPU等计算资源进行时间维度的优化分配', 提示:'大白话：水库调水，云调度调GPU——都是预测需求、预留冗余、动态分配', 跨学科别名:'GPU调度|算力分配|资源调度' },
  { 学科:'计算机', prefix:'c', 名称:'算力成本', 翻译:'Compute cost', 本质:'AI项目中使用计算资源的费用，需要精确核算到每张GPU卡每小时的投入产出', 提示:'大白话：一张A100每小时多少钱、产出多少token、ROI是多少', 跨学科别名:'GPU成本|云计算成本|算力开销' },
  { 学科:'计算机', prefix:'c', 名称:'数据质检', 翻译:'Data quality check', 本质:'对训练数据进行质量检验，确保数据准确、完整、无偏见', 提示:'大白话：模型好不好，先看数据好不好。垃圾进垃圾出', 跨学科别名:'数据质量检查|数据验证|数据清洗' },
  { 学科:'跨学科', prefix:'x', 名称:'时间压力测试', 翻译:'Time pressure test', 本质:'对任何制造紧迫感的信息自动启动的质疑程序：为什么需要通过焦虑来推销', 提示:'大白话：告诉你立即行动、错过等十年的——真正的好机会不需要urgency', 跨学科别名:'紧迫感测试|焦虑检测|反催促' },
  { 学科:'跨学科', prefix:'x', 名称:'新话', 翻译:'Newspeak', 本质:'奥威尔在《1984》中创造的概念：通过缩减词汇量来消灭异端思维的可能性', 提示:'大白话：把词删了，你就想不了了。党八股的终极进化版', 跨学科别名:'新语|语言控制|话语缩减' },
  { 学科:'跨学科', prefix:'x', 名称:'数字遗忘', 翻译:'Digital forgetting', 本质:'通过审查和删除手段制造信息稀缺，而被删除的内容反而更有价值', 提示:'大白话：平台上活着的是想让你看的，死了的才是害怕你知道的', 跨学科别名:'审查经济学|信息删除|数字审查' },
  { 学科:'跨学科', prefix:'x', 名称:'四步升维法', 翻译:'Four-step dimension elevation', 本质:'大白话→学术名→应用场景→行动指南的概念理解方法论', 提示:'大白话：先用傻子能懂的话说，再找学术术语，再映射到真实案例，再变成可执行动作', 跨学科别名:'升维法|四步理解法|概念升维' },
  { 学科:'跨学科', prefix:'x', 名称:'概念交叉检测表', 翻译:'Concept cross-check matrix', 本质:'面试/转行/报班前用14个问题交叉验证的防忽悠工具', 提示:'大白话：报班前问14个问题，3个以上答是就是陷阱', 跨学科别名:'14问检测|交叉验证表|防忽悠清单' },
  { 学科:'跨学科', prefix:'x', 名称:'元技能', 翻译:'Meta-skill', 本质:'学习其他技能的能力，包括批判性思维、信息筛选、快速阅读、概念映射', 提示:'大白话：学技能的技能。具体技能可能被替代，元技能不会', 跨学科别名:'元能力|可迁移技能|底层能力' },
  { 学科:'跨学科', prefix:'x', 名称:'无用阶级', 翻译:'Unworking class', 本质:'Harari提出的概念：不仅是失业，而是根本无法就业的大规模人群', 提示:'大白话：不是找不到工作，是AI让你从根上没用了', 跨学科别名:'无用阶层|不可就业阶层|新无用阶级' },
  { 学科:'跨学科', prefix:'x', 名称:'概念网络', 翻译:'Concept network', 本质:'将单个概念通过同物异名、上下位、因果等关系连接成的知识网络', 提示:'大白话：单个词是子弹，概念网络才是火力网。词与词连起来才有防御力', 跨学科别名:'知识网络|概念图谱|认知网络' },
  { 学科:'跨学科', prefix:'x', 名称:'黑箱审计', 翻译:'Black box audit', 本质:'对无法直接观测的系统内部进行验证，类似工程的隐蔽工程验收', 提示:'大白话：看不见里面不代表不用检查。用LIME/SHAP等方法给模型做透视', 跨学科别名:'模型审计|可解释性审计|隐蔽验收' },
  { 学科:'跨学科', prefix:'x', 名称:'范围蔓延', 翻译:'Scope creep', 本质:'项目范围不受控地扩大，通常由持续的小需求变更累积导致', 提示:'大白话：客户说再加个功能，加着加着项目就失控了', 跨学科别名:'需求蔓延|范围扩散|变更失控' },
];

const inserted = [];
const skipped = [];

for (const term of fixTerms) {
  // 检查名称是否已存在
  const existing = db.prepare('SELECT 词条ID, 名称 FROM 词条 WHERE 名称 = ?').get(term.名称);
  if (existing) {
    skipped.push(`${term.名称} (已存在: ${existing.词条ID})`);
    continue;
  }

  // 正确获取该学科最大ID - 遍历所有匹配前缀的ID
  const allRows = db.prepare(`SELECT 词条ID FROM 词条 WHERE 学科 = ?`).all(term.学科);
  let maxN = 0;
  const prefixPattern = new RegExp(`^${term.prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\d+)$`);
  for (const r of allRows) {
    const m = r.词条ID.match(prefixPattern);
    if (m) {
      maxN = Math.max(maxN, parseInt(m[1]));
    }
  }
  const nextNum = maxN + 1;
  const newId = `${term.prefix}${nextNum}`;

  try {
    db.prepare(`INSERT INTO 词条 (词条ID, 学科, 名称, 翻译, 本质, 提示, 跨学科别名, 热度) VALUES (?, ?, ?, ?, ?, ?, ?, 0)`)
      .run(newId, term.学科, term.名称, term.翻译, term.本质, term.提示, term.跨学科别名);
    inserted.push(`${newId}: ${term.名称}`);
  } catch (e) {
    skipped.push(`${term.名称} (错误: ${e.message})`);
  }
}

console.log(`成功插入 ${inserted.length} 个:`);
inserted.forEach(s => console.log('  ' + s));
console.log(`\n跳过 ${skipped.length} 个:`);
skipped.forEach(s => console.log('  ' + s));

const stats = db.prepare('SELECT 学科, COUNT(*) as cnt FROM 词条 GROUP BY 学科 ORDER BY cnt DESC').all();
console.log(`\n=== 数据库统计 ===`);
let total = 0;
stats.forEach(s => { console.log(`  ${s.学科}: ${s.cnt}`); total += s.cnt; });
console.log(`  总计: ${total}`);

db.close();
