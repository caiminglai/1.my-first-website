const { prepare } = require("../db");
const cache = require("./cache");

const DISCIPLINE_COLORS = {
  math: "#5B7BA0", // 数学 - 蓝灰
  physics: "#6B9B8E", // 物理学 - 青绿
  chem: "#9B7B5E", // 化学 - 土棕
  bio: "#5B9B6E", // 生物学 - 森林绿
  cross: "#8B7D6B", // 跨学科 - 棕灰
  cs: "#4A9B8E", // 计算机 - 青蓝
  econ: "#B8783A", // 经济学 - 金橙
  law: "#6B7B5E", // 法律/政策 - 橄榄绿
  med: "#A45D6A", // 医学/心理 - 酒红
  cyber: "#7B6BA0", // 控制论 - 紫罗兰
};

function getNodes() {
  return cache.remember("graph_nodes", () => {
    const rows = prepare(
      "SELECT 词条ID as id, 学科 as discipline, 名称 as name, 翻译 as translation, 热度 as hot FROM 词条",
    ).all();
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      discipline: r.discipline,
      color: DISCIPLINE_COLORS[r.discipline] || "#8B7D6B",
      radius: r.hot ? 12 : 8,
      translation: r.translation,
    }));
  });
}

function getLinks() {
  return cache.remember("graph_links", () =>
    prepare(
      "SELECT 源节点ID as source, 目标节点ID as target, 关系标签 as label FROM 图谱关系",
    ).all(),
  );
}

module.exports = {
  getNodes,
  getLinks,
};