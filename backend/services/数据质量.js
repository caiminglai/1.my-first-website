const { prepare } = require("../db/入口");

function getQualityReport() {
  const totalRow = prepare("SELECT COUNT(*) as total FROM 词条").get();
  const total_terms = totalRow ? totalRow.total : 0;

  const emptyDescRow = prepare(
    "SELECT COUNT(*) as count FROM 词条 WHERE 翻译 IS NULL OR 翻译 = '' OR 本质 IS NULL OR 本质 = '' OR 提示 IS NULL OR 提示 = ''",
  ).get();
  const empty_description = emptyDescRow ? emptyDescRow.count : 0;

  const duplicateRows = prepare(
    "SELECT 名称 as name, COUNT(*) as cnt FROM 词条 GROUP BY 名称 HAVING cnt > 1 ORDER BY cnt DESC",
  ).all();
  const duplicate_names = duplicateRows.map((r) => ({
    name: r.name,
    count: r.cnt,
  }));

  const missingDiscRows = prepare(
    "SELECT 词条ID as id, 名称 as name FROM 词条 WHERE 学科 IS NULL OR 学科 = '' ORDER BY 词条ID",
  ).all();
  const missing_discipline = missingDiscRows.map((r) => ({
    id: r.id,
    name: r.name,
  }));

  const orphanRows = prepare(
    `SELECT gl.源节点ID as source_id, gl.目标节点ID as target_id, gl.关系标签 as label
     FROM 图谱关系 gl
     WHERE NOT EXISTS (SELECT 1 FROM 词条 t WHERE t.词条ID = gl.源节点ID)
        OR NOT EXISTS (SELECT 1 FROM 词条 t WHERE t.词条ID = gl.目标节点ID)`,
  ).all();
  const orphan_links = orphanRows.map((r) => ({
    source: r.source_id,
    target: r.target_id,
    label: r.label,
  }));

  return {
    total_terms,
    empty_description,
    duplicate_names,
    missing_discipline,
    orphan_links,
  };
}

module.exports = {
  getQualityReport,
};