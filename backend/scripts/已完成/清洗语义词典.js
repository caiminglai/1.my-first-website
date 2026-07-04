/**
 * 语义词典.db 清洗脚本
 * 4张表：同义关系、反义关系、抽象关系、简称关系
 */
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', '..', 'data', '语义词典.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

const results = {};

// ══════════════════════════════════════════════
// 1. 简称关系 — 删除学校/公司/政府/银行/医院等机构简称
// ══════════════════════════════════════════════
let before = db.prepare('SELECT COUNT(*) as c FROM 简称关系').get().c;

// 学校名
db.prepare("DELETE FROM 简称关系 WHERE 全称 LIKE '%中学' OR 全称 LIKE '%高中' OR 全称 LIKE '%小学'").run();
// 大学/学院
db.prepare("DELETE FROM 简称关系 WHERE 全称 LIKE '%大学' OR 全称 LIKE '%学院'").run();
// 公司/集团/股份/有限
db.prepare("DELETE FROM 简称关系 WHERE 全称 LIKE '%公司' OR 全称 LIKE '%集团' OR 全称 LIKE '%股份' OR 全称 LIKE '%有限'").run();
// 银行/信用社
db.prepare("DELETE FROM 简称关系 WHERE 全称 LIKE '%银行' OR 全称 LIKE '%信用社'").run();
// 医院/卫生所/卫生院
db.prepare("DELETE FROM 简称关系 WHERE 全称 LIKE '%医院' OR 全称 LIKE '%卫生院'").run();
// 政府机构（政府/委员会/局/办公室/人民）
db.prepare("DELETE FROM 简称关系 WHERE 全称 LIKE '%政府' OR 全称 LIKE '%委员会' OR 全称 LIKE '%办公室' OR 全称 LIKE '%人民%'").run();
// 协会/学会/联合会/促进会
db.prepare("DELETE FROM 简称关系 WHERE 全称 LIKE '%协会' OR 全称 LIKE '%学会' OR 全称 LIKE '%联合会'").run();
// 电视台/广播电台/报社/杂志
db.prepare("DELETE FROM 简称关系 WHERE 全称 LIKE '%电视台' OR 全称 LIKE '%广播' OR 全称 LIKE '%报社' OR 全称 LIKE '%杂志'").run();
// 场馆（体育馆/博物馆/图书馆/展览馆）
db.prepare("DELETE FROM 简称关系 WHERE 全称 LIKE '%体育馆' OR 全称 LIKE '%博物馆' OR 全称 LIKE '%图书馆' OR 全称 LIKE '%展览馆'").run();
// 酒店/宾馆/饭店
db.prepare("DELETE FROM 简称关系 WHERE 全称 LIKE '%酒店' OR 全称 LIKE '%宾馆' OR 全称 LIKE '%饭店'").run();

let after = db.prepare('SELECT COUNT(*) as c FROM 简称关系').get().c;
results['简称关系'] = { before, after, deleted: before - after };

// ══════════════════════════════════════════════
// 2. 同义关系 — 删除书名/教材/超长/人名/非术语
// ══════════════════════════════════════════════
before = db.prepare('SELECT COUNT(*) as c FROM 同义关系').get().c;

// 含书名号《》
db.prepare("DELETE FROM 同义关系 WHERE 主词 LIKE '%《%' OR 同义词 LIKE '%《%' OR 主词 LIKE '%》%' OR 同义词 LIKE '%》%'").run();
// 10字以上超长条目（定义型/书名/教材全名）
db.prepare("DELETE FROM 同义关系 WHERE length(主词) >= 10 OR length(同义词) >= 10").run();
// 同人/小说/漫画/游戏名
db.prepare("DELETE FROM 同义关系 WHERE 主词 LIKE '%同人%' OR 同义词 LIKE '%同人%' OR 主词 LIKE '%小说%' OR 主词 LIKE '%漫画%' OR 主词 LIKE '%游戏%'").run();
// 考研/教材/教程/课本/习题
db.prepare("DELETE FROM 同义关系 WHERE 主词 LIKE '%考研%' OR 主词 LIKE '%教材%' OR 主词 LIKE '%教程%' OR 主词 LIKE '%课本%' OR 主词 LIKE '%习题%'").run();
// 含破折号/冒号（标题型）
db.prepare("DELETE FROM 同义关系 WHERE 主词 LIKE '%：%' OR 同义词 LIKE '%：%' OR 主词 LIKE '%—%' OR 同义词 LIKE '%—%'").run();
// 含间隔号·且任一方>=5字（书名变体）
db.prepare("DELETE FROM 同义关系 WHERE (主词 LIKE '%·%' OR 同义词 LIKE '%·%') AND (length(主词) >= 5 OR length(同义词) >= 5)").run();

after = db.prepare('SELECT COUNT(*) as c FROM 同义关系').get().c;
results['同义关系'] = { before, after, deleted: before - after };

// ══════════════════════════════════════════════
// 3. 抽象关系 — 删除股票代码/大学/公司/学校/医院
// ══════════════════════════════════════════════
before = db.prepare('SELECT COUNT(*) as c FROM 抽象关系').get().c;

// 股票代码（.SZ/.SH/.SI/.HK/.BJ 等）
db.prepare("DELETE FROM 抽象关系 WHERE 具体词 LIKE '%.SZ' OR 具体词 LIKE '%.SH' OR 具体词 LIKE '%.SI' OR 具体词 LIKE '%.HK' OR 具体词 LIKE '%.BJ' OR 具体词 LIKE '%.SS'").run();
// 大学/学院
db.prepare("DELETE FROM 抽象关系 WHERE 具体词 LIKE '%大学' OR 具体词 LIKE '%学院'").run();
// 公司/集团
db.prepare("DELETE FROM 抽象关系 WHERE 具体词 LIKE '%公司' OR 具体词 LIKE '%集团'").run();
// 中学/小学/医院
db.prepare("DELETE FROM 抽象关系 WHERE 具体词 LIKE '%中学' OR 具体词 LIKE '%小学' OR 具体词 LIKE '%医院'").run();
// 上位概念是"公司"的（如 XX ↑ 公司）
db.prepare("DELETE FROM 抽象关系 WHERE 上位概念 = '公司'").run();

after = db.prepare('SELECT COUNT(*) as c FROM 抽象关系').get().c;
results['抽象关系'] = { before, after, deleted: before - after };

// ══════════════════════════════════════════════
// 4. 反义关系 — 删除超长/书名
// ══════════════════════════════════════════════
before = db.prepare('SELECT COUNT(*) as c FROM 反义关系').get().c;

// 8字以上
db.prepare("DELETE FROM 反义关系 WHERE length(词1) >= 8 OR length(词2) >= 8").run();

after = db.prepare('SELECT COUNT(*) as c FROM 反义关系').get().c;
results['反义关系'] = { before, after, deleted: before - after };

// ══════════════════════════════════════════════
// 输出结果
// ══════════════════════════════════════════════
console.log('=== 语义词典清洗结果 ===\n');
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

db.close();
