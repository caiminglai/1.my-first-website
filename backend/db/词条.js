const { prepare } = require("./入口");

// 全中文路线：数据库词条.学科直接存中文名称（如"生物学""计算机"），
// API 响应的 discipline 字段也直接返回中文名称，前端 DISCIPLINES.id 同样使用中文。
const TERM_COLUMNS = `t.词条ID as id, t.学科 as discipline, t.名称 as name, t.翻译 as translation, t.本质 as essence, t.提示 as tip, t.跨学科别名 as aliases, t.热度 as hot, t.创建时间 as created_at`;

function parseAliases(row) {
  if (!row || !row.aliases) return [];
  try {
    const parsed = JSON.parse(row.aliases);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function withAliases(row) {
  if (!row) return row;
  row.aliases = parseAliases(row);
  return row;
}

function getTerms(page, pageSize, discipline) {
  let where = "";
  const params = [];
  if (discipline) {
    where = "WHERE 学科 = ?";
    params.push(discipline);
  }

  const { count } = prepare(`SELECT COUNT(*) as count FROM 词条 t ${where}`).get(
    ...params,
  );
  const terms = prepare(
    `SELECT ${TERM_COLUMNS} FROM 词条 t ${where} LIMIT ? OFFSET ?`,
  ).all(
    ...params,
    pageSize,
    (page - 1) * pageSize,
  );

  return { terms: terms.map(withAliases), total: count };
}

function searchTerms(query, limit) {
  const searchTerm = `%${query}%`;
  return prepare(`
    SELECT ${TERM_COLUMNS} FROM 词条 t
    WHERE t.名称 LIKE ? OR t.翻译 LIKE ? OR t.本质 LIKE ? OR t.提示 LIKE ?
    LIMIT ?
  `).all(searchTerm, searchTerm, searchTerm, searchTerm, limit).map(withAliases);
}

function getRecentTerms(limit) {
  return prepare(
    `SELECT 词条ID as id, 名称 as name, 学科 as discipline, 创建时间 as created_at FROM 词条 ORDER BY 创建时间 DESC LIMIT ?`,
  ).all(limit);
}

function getHotTerms() {
  return prepare(
    `SELECT ${TERM_COLUMNS} FROM 词条 t WHERE t.热度 = 1 ORDER BY t.名称`,
  ).all().map(withAliases);
}

function getDisciplines() {
  return prepare(`
    SELECT d.学科名称 as id, d.学科名称 as name, d.学科颜色 as color, d.学科描述 as description, d.显示顺序 as display_order,
           COUNT(t.词条ID) AS term_count
    FROM 学科 d
    LEFT JOIN 词条 t ON t.学科 = d.学科名称
    GROUP BY d.学科名称
    ORDER BY d.显示顺序, d.学科名称
  `).all();
}

function getTermById(id) {
  return withAliases(
    prepare(`SELECT ${TERM_COLUMNS} FROM 词条 t WHERE t.词条ID = ?`).get(id),
  );
}

function createTerm(id, discipline, name, translation, essence, tip, hot, aliases) {
  const aliasesJson = aliases && Array.isArray(aliases) ? JSON.stringify(aliases) : "[]";
  return prepare(
    `INSERT INTO 词条 (词条ID, 学科, 名称, 翻译, 本质, 提示, 跨学科别名, 热度) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    discipline,
    name,
    translation || "",
    essence || "",
    tip || "",
    aliasesJson,
    hot ? 1 : 0,
  );
}

function updateTerm(id, updates) {
  const fields = [];
  const values = [];
  const mapping = { name: "名称", translation: "翻译", essence: "本质", tip: "提示" };
  for (const key of ["name", "translation", "essence", "tip"]) {
    if (updates[key] !== undefined) {
      fields.push(`${mapping[key]} = ?`);
      values.push(updates[key]);
    }
  }
  if (updates.aliases !== undefined) {
    fields.push("跨学科别名 = ?");
    values.push(
      Array.isArray(updates.aliases) ? JSON.stringify(updates.aliases) : "[]",
    );
  }
  if (updates.hot !== undefined) {
    fields.push("热度 = ?");
    values.push(updates.hot ? 1 : 0);
  }
  values.push(id);
  return prepare(`UPDATE 词条 SET ${fields.join(", ")} WHERE 词条ID = ?`).run(
    ...values,
  );
}

function deleteTerm(id) {
  return prepare("DELETE FROM 词条 WHERE 词条ID = ?").run(id);
}

function getAllTerms(discipline) {
  let terms;
  if (discipline) {
    terms = prepare(`SELECT ${TERM_COLUMNS} FROM 词条 t WHERE t.学科 = ?`).all(
      discipline,
    );
  } else {
    terms = prepare(`SELECT ${TERM_COLUMNS} FROM 词条 t`).all();
  }
  return terms.map(withAliases);
}

function getRandomTermFromDb(discipline) {
  const where = discipline ? "WHERE 学科 = ?" : "";
  const params = discipline ? [discipline] : [];
  const row = prepare(`SELECT ${TERM_COLUMNS} FROM 词条 t ${where} ORDER BY RANDOM() LIMIT 1`).get(
    ...params,
  );
  return withAliases(row || null);
}

module.exports = {
  getTerms,
  searchTerms,
  getRecentTerms,
  getHotTerms,
  getDisciplines,
  getTermById,
  createTerm,
  updateTerm,
  deleteTerm,
  getAllTerms,
  getRandomTermFromDb,
};
