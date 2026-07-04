/**
 * 语义词典.db 第二轮清洗
 * 补漏：学校/军校/研究所/中心/政府/军事/会议/条约/金融/网站/交通/影视/年份条目
 */
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', '..', 'data', '语义词典.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

const results = {};

// ══════════════════════════════════════════════
// 1. 简称关系 — 补漏
// ══════════════════════════════════════════════
let before = db.prepare('SELECT COUNT(*) as c FROM 简称关系').get().c;

// 学校/军校/党校/小学
db.prepare("DELETE FROM 简称关系 WHERE 全称 LIKE '%学校' OR 全称 LIKE '%军校' OR 全称 LIKE '%党校' OR 全称 LIKE '%小学'").run();
// 研究所/研究院/研究中心/科研中心
db.prepare("DELETE FROM 简称关系 WHERE 全称 LIKE '%研究所' OR 全称 LIKE '%研究院' OR 全称 LIKE '%研究中心'").run();
// 政府部委/局/处/办
db.prepare("DELETE FROM 简称关系 WHERE (全称 LIKE '%部' OR 全称 LIKE '%局' OR 全称 LIKE '%处' OR 全称 LIKE '%办') AND (全称 LIKE '%委%' OR 全称 LIKE '%省%' OR 全称 LIKE '%市%' OR 全称 LIKE '%县%' OR 全称 LIKE '%区%')").run();
// 会议/论坛/峰会/大会
db.prepare("DELETE FROM 简称关系 WHERE 全称 LIKE '%大会%' OR 全称 LIKE '%会议%' OR 全称 LIKE '%论坛%' OR 全称 LIKE '%峰会%'").run();
// 条约/协定/公约
db.prepare("DELETE FROM 简称关系 WHERE 全称 LIKE '%条约%' OR 全称 LIKE '%协定%' OR 全称 LIKE '%公约%'").run();
// 基金/证券/交易所/期货
db.prepare("DELETE FROM 简称关系 WHERE 全称 LIKE '%基金%' OR 全称 LIKE '%交易所%' OR 全称 LIKE '%证券%' OR 全称 LIKE '%期货%'").run();
// 贴吧/网站
db.prepare("DELETE FROM 简称关系 WHERE 全称 LIKE '%贴吧%' OR 全称 LIKE '%网站%'").run();
// 铁路/公路/航线/高速
db.prepare("DELETE FROM 简称关系 WHERE 全称 LIKE '%铁路%' OR 全称 LIKE '%公路%' OR 全称 LIKE '%航线%' OR 全称 LIKE '%高速%'").run();
// 机场/车站/港口/码头
db.prepare("DELETE FROM 简称关系 WHERE 全称 LIKE '%机场%' OR 全称 LIKE '%车站%' OR 全称 LIKE '%港口%' OR 全称 LIKE '%码头%'").run();
// 部队/军区/军分区/师/团（军事单位）
db.prepare("DELETE FROM 简称关系 WHERE 全称 LIKE '%部队%' OR 全称 LIKE '%军区%' OR 全称 LIKE '%军分区%' OR 全称 LIKE '%司令部%'").run();
// 服务中心/服务站/服务站/服务站
db.prepare("DELETE FROM 简称关系 WHERE 全称 LIKE '%服务中心%' OR 全称 LIKE '%服务站%'").run();
// 许可证/申请书/申请表 — 不是术语简称
db.prepare("DELETE FROM 简称关系 WHERE 全称 LIKE '%许可证' OR 全称 LIKE '%申请书' OR 全称 LIKE '%申请表%'").run();

let after = db.prepare('SELECT COUNT(*) as c FROM 简称关系').get().c;
results['简称关系'] = { before, after, deleted: before - after };

// ══════════════════════════════════════════════
// 2. 抽象关系 — 补漏
// ══════════════════════════════════════════════
before = db.prepare('SELECT COUNT(*) as c FROM 抽象关系').get().c;

// 上位概念是港股/A股/基金/指数
db.prepare("DELETE FROM 抽象关系 WHERE 上位概念 IN ('港股', 'A股', '基金', '指数', '申万指数')").run();
// 含年份的长条目（如 2004年电影奖项）
db.prepare("DELETE FROM 抽象关系 WHERE 具体词 GLOB '*[0-9][0-9][0-9][0-9]年*' AND length(具体词) >= 6").run();
// 电视剧/电影/动画/综艺
db.prepare("DELETE FROM 抽象关系 WHERE 具体词 LIKE '%电视剧%' OR 具体词 LIKE '%电影%' OR 具体词 LIKE '%动画%' OR 具体词 LIKE '%综艺%'").run();
// 具体公司/基金名
db.prepare("DELETE FROM 抽象关系 WHERE 具体词 LIKE '%公司' OR 具体词 LIKE '%基金%' OR 具体词 LIKE '%银行%'").run();
// 大学/学院/中学/医院（漏网）
db.prepare("DELETE FROM 抽象关系 WHERE 具体词 LIKE '%大学' OR 具体词 LIKE '%学院' OR 具体词 LIKE '%中学' OR 具体词 LIKE '%医院%'").run();
// 上位概念是"学校/高校/医院"的
db.prepare("DELETE FROM 抽象关系 WHERE 上位概念 IN ('高校', '学校', '医院', '大学')").run();

after = db.prepare('SELECT COUNT(*) as c FROM 抽象关系').get().c;
results['抽象关系'] = { before, after, deleted: before - after };

// ══════════════════════════════════════════════
// 3. 同义关系 — 补漏（人名/地名）
// ══════════════════════════════════════════════
before = db.prepare('SELECT COUNT(*) as c FROM 同义关系').get().c;

// 含"寺/庙/观/庵"（寺庙名，如 霍科寺 → 和科寺）
db.prepare("DELETE FROM 同义关系 WHERE (主词 LIKE '%寺' OR 主词 LIKE '%庙' OR 主词 LIKE '%观' OR 主词 LIKE '%庵') AND length(主词) >= 3 AND length(主词) <= 5").run();
// 含省/市/县/区 + 山/河/湖（地名）
db.prepare("DELETE FROM 同义关系 WHERE (主词 LIKE '%省%' OR 主词 LIKE '%市%' OR 主词 LIKE '%县%') AND length(主词) >= 4").run();

after = db.prepare('SELECT COUNT(*) as c FROM 同义关系').get().c;
results['同义关系'] = { before, after, deleted: before - after };

// ══════════════════════════════════════════════
// 输出结果
// ══════════════════════════════════════════════
console.log('=== 语义词典 第二轮清洗结果 ===\n');
let totalDeleted = 0;
for (const [t, r] of Object.entries(results)) {
  console.log('【' + t + '】' + r.before.toLocaleString() + ' → ' + r.after.toLocaleString() + '（删除 ' + r.deleted.toLocaleString() + '）');
  totalDeleted += r.deleted;
}
console.log('\n总计删除: ' + totalDeleted.toLocaleString() + ' 条');

// VACUUM
console.log('\n正在 VACUUM...');
db.exec('VACUUM');

const dbSize = fs.statSync(DB_PATH).size;
console.log('数据库大小: ' + (dbSize / 1024 / 1024).toFixed(1) + ' MB');

// 最终统计
console.log('\n=== 最终各表数据量 ===');
const tables = ['同义关系', '反义关系', '抽象关系', '简称关系'];
let grandTotal = 0;
for (const t of tables) {
  const c = db.prepare('SELECT COUNT(*) as c FROM "' + t + '"').get().c;
  grandTotal += c;
  console.log('  ' + t + ': ' + c.toLocaleString());
}
console.log('总计: ' + grandTotal.toLocaleString() + ' 条');

db.close();
