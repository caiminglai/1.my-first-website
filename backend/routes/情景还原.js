/**
 * 情景还原路由
 * GET /api/v1/scenarios  全部情景
 */

const express = require("express");
const router = express.Router();
const scenariosService = require("../services/情景还原");

router.get("/", (req, res) => {
  try {
    const scenarios = scenariosService.getScenarios();
    res.json({ success: true, data: scenarios });
  } catch (error) {
    console.error("[Scenarios Error]", error);
    res.status(500).json({
      success: false,
      error: { code: "SCENARIOS_ERROR", message: error.message },
    });
  }
});

module.exports = router;
