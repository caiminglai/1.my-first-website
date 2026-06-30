/**
 * 图谱路由
 * GET /api/v1/graph/nodes  节点
 * GET /api/v1/graph/links  关系
 */

const express = require("express");
const router = express.Router();
const graphService = require("../services/知识图谱");

router.get("/nodes", (req, res) => {
  try {
    const nodes = graphService.getNodes();
    res.json({ success: true, data: nodes });
  } catch (error) {
    console.error("[Graph Nodes Error]", error);
    res.status(500).json({
      success: false,
      error: { code: "GRAPH_ERROR", message: error.message },
    });
  }
});

router.get("/links", (req, res) => {
  try {
    const links = graphService.getLinks();
    res.json({ success: true, data: links });
  } catch (error) {
    console.error("[Graph Links Error]", error);
    res.status(500).json({
      success: false,
      error: { code: "GRAPH_ERROR", message: error.message },
    });
  }
});

module.exports = router;
