/**
 * 语义词典 API
 *
 * 数据来源：ChineseSemanticKB（12类中文语义词典）
 * 提供同义词、反义词、简称、上下位概念查询
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const Database = require('better-sqlite3');

// ── 数据库连接（只读） ──
const DB_PATH = path.join(__dirname, '..', '..', 'data', '语义词典.db');
let db;

try {
  db = new Database(DB_PATH, { readonly: true });
  db.pragma('journal_mode = WAL');
  console.log('[语义库] 语义词典已加载');
} catch (err) {
  console.warn('[语义库] 语义词典未找到，相关接口不可用');
  console.warn('  运行: node scripts/导入语义词典.js');
}

// ── 中间件：检查数据库可用 ──
function checkDb(req, res, next) {
  if (!db) {
    return res.status(503).json({
      error: '语义词典未初始化',
      hint: '请先运行 node scripts/导入语义词典.js'
    });
  }
  next();
}

// ── 查询同义词 ──
// GET /api/v1/semantics/synonyms?word=边际效用&limit=20
router.get('/synonyms', checkDb, (req, res) => {
  const { word, limit = 20 } = req.query;
  if (!word) {
    return res.status(400).json({ error: '缺少参数 word' });
  }

  const lim = Math.min(parseInt(limit) || 20, 100);

  // 查主词的同义词
  const asMain = db.prepare(`
    SELECT 同义词 FROM 同义关系 WHERE 主词 = ? LIMIT ?
  `).all(word, lim);

  // 查作为同义词时对应的主词
  const asSynonym = db.prepare(`
    SELECT 主词 FROM 同义关系 WHERE 同义词 = ? LIMIT ?
  `).all(word, lim);

  res.json({
    查询词: word,
    同义词: asMain.map(r => r.同义词),
    所属主词: asSynonym.map(r => r.主词),
    总数: {
      作为主词: db.prepare('SELECT COUNT(*) as c FROM 同义关系 WHERE 主词 = ?').get(word).c,
      作为同义词: db.prepare('SELECT COUNT(*) as c FROM 同义关系 WHERE 同义词 = ?').get(word).c
    }
  });
});

// ── 查询反义词 ──
// GET /api/v1/semantics/antonyms?word=一丝不苟&limit=20
router.get('/antonyms', checkDb, (req, res) => {
  const { word, limit = 20 } = req.query;
  if (!word) {
    return res.status(400).json({ error: '缺少参数 word' });
  }

  const lim = Math.min(parseInt(limit) || 20, 100);

  const asWord1 = db.prepare(`
    SELECT 词2 FROM 反义关系 WHERE 词1 = ? LIMIT ?
  `).all(word, lim);

  const asWord2 = db.prepare(`
    SELECT 词1 FROM 反义关系 WHERE 词2 = ? LIMIT ?
  `).all(word, lim);

  res.json({
    查询词: word,
    反义词: asWord1.map(r => r.词2),
    反义来源: asWord2.map(r => r.词1)
  });
});

// ── 查询简称 ──
// GET /api/v1/semantics/abbrevs?word=北京大学
// GET /api/v1/semantics/abbrevs?word=北大&direction=reverse
router.get('/abbrevs', checkDb, (req, res) => {
  const { word, direction, limit = 20 } = req.query;
  if (!word) {
    return res.status(400).json({ error: '缺少参数 word' });
  }

  const lim = Math.min(parseInt(limit) || 20, 100);

  let result = { 查询词: word };

  if (direction === 'reverse') {
    // 输入简称，查全称
    const fullNames = db.prepare(`
      SELECT 全称 FROM 简称关系 WHERE 简称 = ? LIMIT ?
    `).all(word, lim);
    result.全称 = fullNames.map(r => r.全称);
  } else {
    // 输入全称，查简称
    const shortNames = db.prepare(`
      SELECT 简称 FROM 简称关系 WHERE 全称 = ? LIMIT ?
    `).all(word, lim);
    result.简称 = shortNames.map(r => r.简称);
  }

  res.json(result);
});

// ── 查询上下位概念 ──
// GET /api/v1/semantics/hypernyms?word=酢酱面
// GET /api/v1/semantics/hyponyms?word=面
router.get('/hypernyms', checkDb, (req, res) => {
  const { word, limit = 20 } = req.query;
  if (!word) {
    return res.status(400).json({ error: '缺少参数 word' });
  }

  const lim = Math.min(parseInt(limit) || 20, 100);

  const parents = db.prepare(`
    SELECT 上位概念 FROM 抽象关系 WHERE 具体词 = ? LIMIT ?
  `).all(word, lim);

  res.json({
    查询词: word,
    上位概念: parents.map(r => r.上位概念)
  });
});

router.get('/hyponyms', checkDb, (req, res) => {
  const { word, limit = 20 } = req.query;
  if (!word) {
    return res.status(400).json({ error: '缺少参数 word' });
  }

  const lim = Math.min(parseInt(limit) || 20, 100);

  const children = db.prepare(`
    SELECT 具体词 FROM 抽象关系 WHERE 上位概念 = ? LIMIT ?
  `).all(word, lim);

  res.json({
    查询词: word,
    下位概念: children.map(r => r.具体词)
  });
});

// ── 综合查询：一次获取某词的所有语义关系 ──
// GET /api/v1/semantics/all?word=边际效用
router.get('/all', checkDb, (req, res) => {
  const { word, limit = 10 } = req.query;
  if (!word) {
    return res.status(400).json({ error: '缺少参数 word' });
  }

  const lim = Math.min(parseInt(limit) || 10, 50);

  const synonyms = db.prepare(
    'SELECT 同义词 FROM 同义关系 WHERE 主词 = ? LIMIT ?'
  ).all(word, lim).map(r => r.同义词);

  const antonyms = db.prepare(
    'SELECT 词2 FROM 反义关系 WHERE 词1 = ? LIMIT ?'
  ).all(word, lim).map(r => r.词2);

  const abbrevs = db.prepare(
    'SELECT 简称 FROM 简称关系 WHERE 全称 = ? LIMIT ?'
  ).all(word, lim).map(r => r.简称);

  const parents = db.prepare(
    'SELECT 上位概念 FROM 抽象关系 WHERE 具体词 = ? LIMIT ?'
  ).all(word, lim).map(r => r.上位概念);

  const children = db.prepare(
    'SELECT 具体词 FROM 抽象关系 WHERE 上位概念 = ? LIMIT ?'
  ).all(word, lim).map(r => r.具体词);

  res.json({
    查询词: word,
    同义词: synonyms,
    反义词: antonyms,
    简称: abbrevs,
    上位概念: parents,
    下位概念: children,
    有数据: synonyms.length + antonyms.length + abbrevs.length + parents.length + children.length > 0
  });
});

// ── 统计信息 ──
// GET /api/v1/semantics/stats
router.get('/stats', checkDb, (req, res) => {
  const counts = {
    同义关系: db.prepare('SELECT COUNT(*) as c FROM 同义关系').get().c,
    反义关系: db.prepare('SELECT COUNT(*) as c FROM 反义关系').get().c,
    简称关系: db.prepare('SELECT COUNT(*) as c FROM 简称关系').get().c,
    抽象关系: db.prepare('SELECT COUNT(*) as c FROM 抽象关系').get().c,
  };

  res.json({
    数据来源: 'ChineseSemanticKB (liuhuanyong)',
    总数: Object.values(counts).reduce((a, b) => a + b, 0),
    分类统计: counts
  });
});

module.exports = router;
