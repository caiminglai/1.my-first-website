/**
 * AI 问答服务层
 * 对接底层 ai.js（多 LLM 提供商）
 */

const { callLLM, callLLMStream, getSupportedProviders } = require("./AI核心");
const { AppError } = require("../utils/应用错误");

function ask({ provider, apiKey, baseUrl, model, question }) {
  if (!question?.trim()) {
    throw new AppError("请输入问题", "MISSING_QUESTION", 400);
  }
  if (!apiKey) {
    throw new AppError("请先配置 API Key", "MISSING_API_KEY", 400);
  }
  return callLLM({ provider, apiKey, baseUrl, model, question });
}

function askStream({ provider, apiKey, baseUrl, model, question }) {
  if (!question?.trim()) {
    throw new AppError("请输入问题", "MISSING_QUESTION", 400);
  }
  if (!apiKey) {
    throw new AppError("请先配置 API Key", "MISSING_API_KEY", 400);
  }
  return callLLMStream({ provider, apiKey, baseUrl, model, question });
}

function getProviders() {
  return getSupportedProviders();
}

async function generateTerm({ provider, apiKey, baseUrl, model, name, discipline }) {
  if (!name?.trim()) {
    throw new AppError("请输入术语名称", "MISSING_TERM_NAME", 400);
  }
  if (!discipline?.trim()) {
    throw new AppError("请选择学科", "MISSING_DISCIPLINE", 400);
  }
  if (!apiKey) {
    throw new AppError("请先配置 API Key", "MISSING_API_KEY", 400);
  }

  const prompt = `你是一位擅长把学术术语翻译成大白话的科普作者。请为下面这个术语生成词条内容。

术语：${name.trim()}
所属学科：${discipline.trim()}

请严格按以下 JSON 格式返回，不要返回任何额外解释：
{
  "translation": "用一句话把术语翻译成初中水平能听懂的大白话（15字以内）",
  "essence": "用2-3句话解释这个术语的本质，避免使用更复杂的术语",
  "tip": "一句防忽悠提示，告诉读者遇到这个术语时应该注意什么",
  "aliases": [
    {"discipline": "其他学科id", "name": "这个术语在该学科里的别名"},
    {"discipline": "另一个学科id", "name": "另一个别名"}
  ]
}

要求：
1. translation 必须是大白话，不能使用原文的同义词敷衍。
2. aliases 只列出真正等价的跨学科别名，不要编造。数量 0-4 个。
3. 所有字段都不能为空字符串。
4. 只输出 JSON，不要 markdown 代码块。`;

  const answer = await callLLM({
    provider,
    apiKey,
    baseUrl,
    model,
    question: prompt,
  });

  try {
    const cleaned = answer
      .replace(/^```(?:json)?\s*/, "")
      .replace(/\s*```$/, "")
      .trim();
    const parsed = JSON.parse(cleaned);
    return {
      translation: String(parsed.translation || "").trim(),
      essence: String(parsed.essence || "").trim(),
      tip: String(parsed.tip || "").trim(),
      aliases: Array.isArray(parsed.aliases)
        ? parsed.aliases
            .filter((a) => a && a.discipline && a.name)
            .map((a) => ({
              discipline: String(a.discipline).trim(),
              name: String(a.name).trim(),
            }))
        : [],
    };
  } catch (err) {
    throw new Error(`AI 返回格式无法解析: ${err.message}`);
  }
}

async function generateComparison({ provider, apiKey, baseUrl, model, nameA, nameB }) {
  if (!nameA?.trim()) {
    throw new AppError("请输入概念A名称", "MISSING_NAME_A", 400);
  }
  if (!nameB?.trim()) {
    throw new AppError("请输入概念B名称", "MISSING_NAME_B", 400);
  }
  if (!apiKey) {
    throw new AppError("请先配置 API Key", "MISSING_API_KEY", 400);
  }

  const prompt = `你是一位擅长对比概念的科普作者。请对比以下两个概念并生成一份结构化内容。

概念 A：${nameA.trim()}
概念 B：${nameB.trim()}

请严格按以下 JSON 格式返回，不要返回任何额外解释或 markdown 代码块：
{
  "title": "一个简洁的对比标题（如：X vs Y）",
  "relationship_type": "两个概念之间的关系类型（如：同义词 / 反义词 / 包含关系 / 相近概念 / 并列概念）",
  "concept_a_plain": "用一句话把概念A翻译成初中水平能听懂的大白话",
  "concept_a_symptom": "概念A在现实中常见的体现方式或应用场景",
  "concept_a_analogy": "用一个生活化的比喻解释概念A",
  "concept_a_fix": "如果概念A是一个容易被误解的点，给出澄清建议",
  "concept_b_plain": "用一句话把概念B翻译成初中水平能听懂的大白话",
  "concept_b_symptom": "概念B在现实中常见的体现方式或应用场景",
  "concept_b_analogy": "用一个生活化的比喻解释概念B",
  "concept_b_fix": "如果概念B是一个容易被误解的点，给出澄清建议",
  "summary": "总结两个概念的核心区别与联系（3-5句话）"
}

要求：
1. 所有字段不能为空字符串。
2. 只输出 JSON，不要 markdown 代码块。`;

  const answer = await callLLM({
    provider,
    apiKey,
    baseUrl,
    model,
    question: prompt,
  });

  try {
    const cleaned = answer
      .replace(/^```(?:json)?\s*/, "")
      .replace(/\s*```$/, "")
      .trim();
    const parsed = JSON.parse(cleaned);
    return {
      title: String(parsed.title || "").trim(),
      relationship_type: String(parsed.relationship_type || "").trim(),
      concept_a_plain: String(parsed.concept_a_plain || "").trim(),
      concept_a_symptom: String(parsed.concept_a_symptom || "").trim(),
      concept_a_analogy: String(parsed.concept_a_analogy || "").trim(),
      concept_a_fix: String(parsed.concept_a_fix || "").trim(),
      concept_b_plain: String(parsed.concept_b_plain || "").trim(),
      concept_b_symptom: String(parsed.concept_b_symptom || "").trim(),
      concept_b_analogy: String(parsed.concept_b_analogy || "").trim(),
      concept_b_fix: String(parsed.concept_b_fix || "").trim(),
      summary: String(parsed.summary || "").trim(),
    };
  } catch (err) {
    throw new Error(`AI 返回格式无法解析: ${err.message}`);
  }
}

module.exports = {
  ask,
  askStream,
  getProviders,
  generateTerm,
  generateComparison,
};
