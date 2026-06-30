/**
 * 学科词库 API
 *
 * 数据来源：DomainWordsDict（68个学科领域，916万词）
 * 提供学科词查询、领域识别、权重排序
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const Database = require('better-sqlite3');

// ── 数据库连接（只读） ──
const DB_PATH = path.join(__dirname, '..', '..', 'data', '学科词库.db');
let db;

try {
  db = new Database(DB_PATH, { readonly: true });
  db.pragma('journal_mode = WAL');
  console.log('[学科库] 学科词库已加载');
} catch (err) {
  console.warn('[学科库] 学科词库未找到，相关接口不可用');
  console.warn('  运行: node scripts/导入学科词库.js');
}

// ── 中间件：检查数据库可用 ──
function checkDb(req, res, next) {
  if (!db) {
    return res.status(503).json({
      error: '学科词库未初始化',
      hint: '请运行 npm run import:学科'
    });
  }
  next();
}

router.use(checkDb);

// ── 查询词语所属学科 ──
// GET /api/v1/domains/lookup?word=机器学习
router.get('/lookup', (req, res) => {
  const { word } = req.query;
  if (!word || word.trim().length === 0) {
    return res.status(400).json({ error: '缺少 word 参数' });
  }

  try {
    const results = db.prepare(`
      SELECT 学科, 权重
      FROM 学科词库
      WHERE 词语 = ?
      ORDER BY 权重 DESC
      LIMIT 20
    `).all(word.trim());

    res.json({
      word: word.trim(),
      domains: results.map(r => ({ domain: r.学科, weight: r.权重 })),
      count: results.length
    });
  } catch (err) {
    console.error('[学科库] lookup错误:', err.message);
    res.status(500).json({ error: '查询失败' });
  }
});

// ── 模糊搜索词语 ──
// GET /api/v1/domains/search?q=量子&domain=物理学
router.get('/search', (req, res) => {
  const { q, domain, limit = 50 } = req.query;
  if (!q || q.trim().length === 0) {
    return res.status(400).json({ error: '缺少 q 参数' });
  }

  const maxLimit = Math.min(parseInt(limit) || 50, 200);
  const keyword = q.trim();

  try {
    let results;
    if (domain) {
      results = db.prepare(`
        SELECT 词语, 权重
        FROM 学科词库
        WHERE 词语 LIKE ? AND 学科 = ?
        ORDER BY 权重 DESC
        LIMIT ?
      `).all(`%${keyword}%`, domain, maxLimit);
    } else {
      results = db.prepare(`
        SELECT 词语, 学科, 权重
        FROM 学科词库
        WHERE 词语 LIKE ?
        ORDER BY 权重 DESC
        LIMIT ?
      `).all(`%${keyword}%`, maxLimit);
    }

    res.json({
      query: keyword,
      domain: domain || '全部',
      results,
      count: results.length
    });
  } catch (err) {
    console.error('[学科库] search错误:', err.message);
    res.status(500).json({ error: '查询失败' });
  }
});

// ── 获取学科列表及词数 ──
// GET /api/v1/domains/list
router.get('/list', (req, res) => {
  try {
    const results = db.prepare(`
      SELECT 学科, COUNT(*) as 词数
      FROM 学科词库
      GROUP BY 学科
      ORDER BY 词数 DESC
    `).all();

    res.json({
      domains: results,
      total: results.length
    });
  } catch (err) {
    console.error('[学科库] list错误:', err.message);
    res.status(500).json({ error: '查询失败' });
  }
});

// ── 统计信息（必须在 /:domain 之前注册，避免被参数路由拦截） ──
// GET /api/v1/domains/stats
router.get('/stats', (req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as c FROM 学科词库').get();
    const domainCount = db.prepare('SELECT COUNT(DISTINCT 学科) as c FROM 学科词库').get();
    const topDomains = db.prepare(`
      SELECT 学科, COUNT(*) as 词数
      FROM 学科词库
      GROUP BY 学科
      ORDER BY 词数 DESC
      LIMIT 10
    `).all();

    res.json({
      总词数: total.c,
      学科数: domainCount.c,
      前十大: topDomains.map(d => ({ 学科: d.学科, 词数: d.词数 }))
    });
  } catch (err) {
    console.error('[学科库] stats错误:', err.message);
    res.status(500).json({ error: '查询失败' });
  }
});

// ── 获取某学科下的词语（分页） ──
// GET /api/v1/domains/:domain?offset=0&limit=100
router.get('/:domain', (req, res) => {
  const { domain } = req.params;
  const { offset = 0, limit = 100 } = req.query;
  const maxLimit = Math.min(parseInt(limit) || 100, 1000);
  const off = parseInt(offset) || 0;

  try {
    const results = db.prepare(`
      SELECT 词语, 权重
      FROM 学科词库
      WHERE 学科 = ?
      ORDER BY 权重 DESC
      LIMIT ? OFFSET ?
    `).all(domain, maxLimit, off);

    const total = db.prepare(`
      SELECT COUNT(*) as c
      FROM 学科词库
      WHERE 学科 = ?
    `).get(domain);

    res.json({
      domain,
      words: results,
      total: total.c,
      offset: off,
      limit: maxLimit
    });
  } catch (err) {
    console.error('[学科库] domain错误:', err.message);
    res.status(500).json({ error: '查询失败' });
  }
});

module.exports = router;
