const { prepare } = require("../db");
const { markDirty } = require("../db");

function getAntibodies(termId, category) {
  let sql = `SELECT 抗体ID as id, 词条ID as term_id, 抗体标题 as title, 抗体描述 as description, 抗体类别 as category, 抗体内容 as content, 创建时间 as created_at FROM 概念抗体 WHERE 1=1`;
  const params = [];
  if (termId) {
    sql += ` AND 词条ID = ?`;
    params.push(termId);
  }
  if (category) {
    sql += ` AND 抗体类别 = ?`;
    params.push(category);
  }
  sql += ` ORDER BY 创建时间 DESC`;
  return prepare(sql).all(...params);
}

function getCategories() {
  const rows = prepare(
    `SELECT DISTINCT 抗体类别 as category FROM 概念抗体 WHERE 抗体类别 IS NOT NULL AND 抗体类别 != '' ORDER BY 抗体类别`,
  ).all();
  return rows.map((r) => r.category);
}

function createAntibody(data) {
  const { id, term_id, title, description, category, content } = data;
  if (!id || !term_id || !title) throw new Error("MISSING_FIELDS");
  prepare(
    `INSERT OR REPLACE INTO 概念抗体 (抗体ID, 词条ID, 抗体标题, 抗体描述, 抗体类别, 抗体内容) VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(id, term_id, title, description || "", category || "", content || "");
  markDirty();
  return { id };
}

function batchCreate(list) {
  if (!Array.isArray(list) || list.length === 0) throw new Error("EMPTY");
  let count = 0;
  for (const item of list) {
    const { id, term_id, title, description, category, content } = item;
    if (id && term_id && title) {
      prepare(
        `INSERT OR REPLACE INTO 概念抗体 (抗体ID, 词条ID, 抗体标题, 抗体描述, 抗体类别, 抗体内容) VALUES (?, ?, ?, ?, ?, ?)`,
      ).run(
        id,
        term_id,
        title,
        description || "",
        category || "",
        content || "",
      );
      count++;
    }
  }
  markDirty();
  return { success: count, failed: list.length - count };
}

function deleteAntibody(id) {
  prepare(`DELETE FROM 概念抗体 WHERE 抗体ID = ?`).run(id);
  markDirty();
  return { id };
}

function toCSV(antibodies) {
  const cols = ["id", "term_id", "title", "category", "description", "content"];
  const header = ["ID", "关联词条", "标题", "分类", "描述", "内容"];
  const esc = (v) => {
    if (v === null || v === undefined) return "";
    let s = String(v);
    if (
      s.includes(",") ||
      s.includes('"') ||
      s.includes("\n") ||
      s.includes("\r")
    ) {
      s = '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  const rows = [header.join(",")];
  for (const a of antibodies) {
    rows.push(cols.map((c) => esc(a[c])).join(","));
  }
  return "\uFEFF" + rows.join("\r\n");
}

function parseCSV(text) {
  if (!text || typeof text !== "string") return [];
  const body = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const parseLine = (line) => {
    const result = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (line[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          cur += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ",") {
          result.push(cur);
          cur = "";
        } else {
          cur += ch;
        }
      }
    }
    result.push(cur);
    return result;
  };
  const records = [];
  let buf = "";
  let inQ = false;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (ch === '"') {
      if (inQ && body[i + 1] === '"') {
        buf += '"';
        i++;
      } else {
        inQ = !inQ;
        buf += '"';
      }
    } else if ((ch === "\n" || ch === "\r") && !inQ) {
      records.push(buf);
      buf = "";
      if (ch === "\r" && body[i + 1] === "\n") i++;
    } else {
      buf += ch;
    }
  }
  if (buf.trim().length > 0 || records.length > 0) records.push(buf);
  const lines = records.filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const normalizedHeader = parseLine(lines[0]).map((c) => c.trim());
  const items = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseLine(lines[i]);
    if (cells.every((c) => !c || !c.trim())) continue;
    const obj = {};
    normalizedHeader.forEach((key, idx) => {
      let field = key;
      const mapping = {
        ID: "id",
        关联词条: "term_id",
        标题: "title",
        分类: "category",
        描述: "description",
        内容: "content",
      };
      if (mapping[field]) field = mapping[field];
      obj[field] = (cells[idx] || "").trim();
    });
    items.push(obj);
  }
  return items;
}

module.exports = {
  getAntibodies,
  getCategories,
  createAntibody,
  batchCreate,
  deleteAntibody,
  toCSV,
  parseCSV,
};
