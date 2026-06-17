const { prepare } = require("./index");

function getNodes() {
  return prepare(`
    SELECT t.词条ID, t.名称, t.学科, d.学科颜色, t.翻译
    FROM 词条 t
    LEFT JOIN 学科 d ON t.学科 = d.学科ID
  `).all();
}

function getLinks() {
  return prepare(`
    SELECT gl.源节点ID as source, gl.目标节点ID as target, gl.关系标签
    FROM 图谱关系 gl
  `).all();
}

function addLink(sourceId, targetId, label) {
  return prepare(
    `INSERT OR IGNORE INTO 图谱关系 (源节点ID, 目标节点ID, 关系标签) VALUES (?, ?, ?)`,
  ).run(sourceId, targetId, label || "");
}

function deleteLink(sourceId, targetId) {
  return prepare(
    "DELETE FROM 图谱关系 WHERE 源节点ID = ? AND 目标节点ID = ?",
  ).run(sourceId, targetId);
}

function deleteLinksByTermId(termId) {
  prepare("DELETE FROM 图谱关系 WHERE 源节点ID = ? OR 目标节点ID = ?").run(
    termId,
    termId,
  );
}

module.exports = {
  getNodes,
  getLinks,
  addLink,
  deleteLink,
  deleteLinksByTermId,
};