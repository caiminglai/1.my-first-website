const Database = require('better-sqlite3');
const db = new Database('../data/同物异名.db');

const terms = [
  // PDF8 概念抗体
  '概念抗体', '三步还原法', '五类忽悠识别术', '术语拆解表', '可信度评分卡',
  '跨学科映射表', '时间压力测试',
  // PDF13 工程迁移
  'MLOps', 'Digital Twin', '数字孪生', 'BIM', '建筑信息模型',
  'EPCM', 'BOQ', '工程量清单', 'WBS', '工作分解结构',
  'SLA', '算力调度', '负载均衡', '模型监控', 'AI治理',
  'Benchmark', '基准测试', '知识管理', '模型评审', '黑箱审计',
  '变更管理', '范围蔓延', '算力成本', '数据合规', '模型版本管理',
  '数据血缘', '实验记录',
  // PDF9 认知防忽悠
  '造血型', '看门狗型', '沉没成本', '路径依赖', '内卷',
  '产业后备军', '认知偏差', '系统1', '系统2', '锚定效应',
  '确认偏差', '幸存者偏差', '损失厌恶', '禀赋效应',
  'Specific Knowledge', '杠杆', '复利'
];

console.log('检查PDF8/9/13中的术语是否已入库:\n');
let found = 0, missing = 0;
terms.forEach(t => {
  const r = db.prepare('SELECT 词条ID, 学科, 名称 FROM 词条 WHERE 名称 = ?').get(t);
  if (r) {
    console.log(`  ✓ ${t} → [${r.词条ID}] ${r.学科}`);
    found++;
  } else {
    console.log(`  ✗ ${t} — 未入库`);
    missing++;
  }
});
console.log(`\n已入库: ${found}, 未入库: ${missing}`);
db.close();
