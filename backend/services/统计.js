const { prepare } = require("../db/入口");
const { markDirty } = require("../db/入口");
const cache = require("./缓存");

function getStats() {
  return cache.remember("stats_summary", () => {
    const totalTerms = prepare("SELECT COUNT(*) as c FROM 词条").get().c;
    const hotTerms = prepare(
      "SELECT COUNT(*) as c FROM 词条 WHERE 热度 = 1",
    ).get().c;
    const totalLinks = prepare("SELECT COUNT(*) as c FROM 图谱关系").get().c;
    const totalComparisons = prepare(
      "SELECT COUNT(*) as c FROM 概念对比",
    ).get().c;
    const totalScenarios = prepare("SELECT COUNT(*) as c FROM 情景还原").get()
      .c;
    const byDiscipline = prepare(
      "SELECT 学科 as discipline, COUNT(*) as count FROM 词条 GROUP BY 学科",
    ).all();

    return {
      totalTerms,
      hotTerms,
      totalLinks,
      totalComparisons,
      totalScenarios,
      byDiscipline: byDiscipline.reduce((acc, r) => {
        acc[r.discipline] = r.count;
        return acc;
      }, {}),
    };
  });
}

function submitFeedback(data) {
  const { type, content, termId, contact } = data;

  if (!type || !content) {
    throw new Error("MISSING_FIELDS");
  }

  prepare(
    "INSERT INTO 用户反馈 (反馈类型, 反馈内容, 关联词条ID, 联系方式) VALUES (?, ?, ?, ?)",
  ).run(type, content, termId || null, contact || null);
  markDirty();
  return { message: "反馈提交成功，感谢！" };
}

function getHealth() {
  return {
    status: "ok",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    cache: cache.getStats(),
  };
}

module.exports = {
  getStats,
  submitFeedback,
  getHealth,
};