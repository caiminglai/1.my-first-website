/**
 * AI 问答路由
 * POST /api/v1/ai/chat      非流式回答
 * POST /api/v1/ai/stream    流式 SSE 回答
 * GET  /api/v1/ai/providers 支持的提供商列表
 *
 * 请求体（chat/stream）：
 *   provider: 'openai' | 'anthropic' | 'alibaba' | 'zhipu' | 'custom'
 *   apiKey:   API Key（必填，由前端传入，保存在浏览器 localStorage）
 *   baseUrl:  自定义 API 地址（可选）
 *   model:    模型名（可选）
 *   question: 用户问题（必填）
 */

const express = require("express");
const router = express.Router();
const aiService = require("../services/ai.service");

// 支持的提供商列表
router.get("/providers", (req, res) => {
  try {
    const providers = aiService.getProviders();
    res.json({ success: true, data: providers });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: error.message },
    });
  }
});

// 非流式对话
router.post("/chat", async (req, res) => {
  try {
    const { provider, apiKey, baseUrl, model, question } = req.body || {};

    if (!question?.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_QUESTION", message: "请输入问题" },
      });
    }
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_API_KEY", message: "请先配置 API Key" },
      });
    }

    const result = await aiService.ask({
      provider,
      apiKey,
      baseUrl,
      model,
      question,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("[AI Chat Error]", error.message);
    if (error.message === "MISSING_QUESTION") {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_QUESTION", message: "请输入问题" },
      });
    }
    if (error.message === "MISSING_API_KEY") {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_API_KEY", message: "请先配置 API Key" },
      });
    }
    res.status(500).json({
      success: false,
      error: { code: "AI_ERROR", message: error.message },
    });
  }
});

// 流式 SSE 对话
router.post("/stream", async (req, res) => {
  try {
    const { provider, apiKey, baseUrl, model, question } = req.body || {};

    if (!question?.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_QUESTION", message: "请输入问题" },
      });
    }
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_API_KEY", message: "请先配置 API Key" },
      });
    }

    // SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders ? res.flushHeaders() : null;

    const stream = await aiService.askStream({
      provider,
      apiKey,
      baseUrl,
      model,
      question,
    });

    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ content: "", done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error("[AI Stream Error]", error.message);
    res.write(
      `data: ${JSON.stringify({ content: "出错了：" + error.message, done: true, error: true })}\n\n`,
    );
    res.end();
  }
});

// 自动生成词条内容（大白话翻译、本质、提示、跨学科别名）
router.post("/generate-term", async (req, res) => {
  try {
    const { provider, apiKey, baseUrl, model, name, discipline } = req.body || {};

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_TERM_NAME", message: "请输入术语名称" },
      });
    }
    if (!discipline?.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_DISCIPLINE", message: "请选择学科" },
      });
    }
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_API_KEY", message: "请先配置 API Key" },
      });
    }

    const result = await aiService.generateTerm({
      provider,
      apiKey,
      baseUrl,
      model,
      name,
      discipline,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("[AI Generate Term Error]", error.message);
    if (error.message === "MISSING_TERM_NAME") {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_TERM_NAME", message: "请输入术语名称" },
      });
    }
    if (error.message === "MISSING_DISCIPLINE") {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_DISCIPLINE", message: "请选择学科" },
      });
    }
    if (error.message === "MISSING_API_KEY") {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_API_KEY", message: "请先配置 API Key" },
      });
    }
    res.status(500).json({
      success: false,
      error: { code: "AI_ERROR", message: error.message },
    });
  }
});

// 自动生成概念对比内容
router.post("/generate-comparison", async (req, res) => {
  try {
    const { provider, apiKey, baseUrl, model, nameA, nameB } = req.body || {};

    if (!nameA?.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_NAME_A", message: "请输入概念A名称" },
      });
    }
    if (!nameB?.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_NAME_B", message: "请输入概念B名称" },
      });
    }
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_API_KEY", message: "请先配置 API Key" },
      });
    }

    const result = await aiService.generateComparison({
      provider,
      apiKey,
      baseUrl,
      model,
      nameA,
      nameB,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("[AI Generate Comparison Error]", error.message);
    if (error.message === "MISSING_NAME_A") {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_NAME_A", message: "请输入概念A名称" },
      });
    }
    if (error.message === "MISSING_NAME_B") {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_NAME_B", message: "请输入概念B名称" },
      });
    }
    if (error.message === "MISSING_API_KEY") {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_API_KEY", message: "请先配置 API Key" },
      });
    }
    res.status(500).json({
      success: false,
      error: { code: "AI_ERROR", message: error.message },
    });
  }
});

module.exports = router;
