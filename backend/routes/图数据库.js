const express = require('express');
const 图数据库服务 = require('../services/图数据库服务');

const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const stats = await 图数据库服务.getStats();
    res.json({ success: true, data: stats });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get('/data', async (req, res) => {
  try {
    const data = await 图数据库服务.getGraphData();
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get('/neighbors/:termId', async (req, res) => {
  try {
    const { termId } = req.params;
    const { depth = 1 } = req.query;
    const neighbors = await 图数据库服务.getNeighbors(termId, parseInt(depth));
    res.json({ success: true, data: neighbors });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get('/path', async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      res.status(400).json({ success: false, message: '缺少 start 或 end 参数' });
      return;
    }
    const path = await 图数据库服务.findPath(start, end);
    res.json({ success: true, data: path });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    if (!q) {
      res.status(400).json({ success: false, message: '缺少 q 参数' });
      return;
    }
    const results = await 图数据库服务.search(q, parseInt(limit));
    res.json({ success: true, data: results });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post('/query', async (req, res) => {
  try {
    const { query } = req.body || {};
    if (!query) {
      res.status(400).json({ success: false, message: '缺少 query 参数' });
      return;
    }
    const results = await 图数据库服务.executeQuery(query);
    res.json({ success: true, data: results });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
