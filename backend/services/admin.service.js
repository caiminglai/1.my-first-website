const adminDb = require("../db/admin");
const graphDb = require("../db/graph");
const { markDirty } = require("../db");
const cache = require("./cache");

function getAdminTerms(page = 1, pageSize = 20, search = "", discipline = "") {
  const safePage = Math.max(1, parseInt(page) || 1);
  const safePageSize = Math.min(50, parseInt(pageSize) || 20);
  return adminDb.getAdminTerms(safePage, safePageSize, search, discipline);
}

function batchCreateTerms(items) {
  const data = Array.isArray(items) ? items : [items];
  const result = adminDb.batchCreateTerms(data);
  if (result.success > 0) {
    markDirty();
    cache.invalidatePrefix("terms_");
    cache.invalidate(
      "disciplines",
      "stats_summary",
      "graph_nodes",
      "graph_links",
    );
  }
  return result;
}

function updateAdminTerm(id, updates) {
  const filteredUpdates = {};
  const validFields = ["name", "translation", "essence", "tip", "hot", "aliases"];

  for (const key of validFields) {
    if (updates[key] !== undefined) {
      filteredUpdates[key] = updates[key];
    }
  }

  if (Object.keys(filteredUpdates).length === 0) {
    throw new Error("NO_FIELDS");
  }

  const current = adminDb.getTermById(id);
  const changes = {};
  if (current) {
    for (const key of validFields) {
      if (filteredUpdates[key] === undefined) continue;
      const curVal = current[key];
      const newVal = filteredUpdates[key];
      // hot 字段特殊：数据库是 0/1，传入是布尔值
      if (key === "hot") {
        const curNorm =
          curVal === 1 || curVal === true || curVal === "1" ? "1" : "0";
        const newNorm =
          newVal === 1 || newVal === true || newVal === "1" ? "1" : "0";
        if (curNorm !== newNorm) {
          changes[key] = { old_value: curNorm, new_value: newNorm };
        }
        continue;
      }
      // aliases 字段特殊：比较 JSON 序列化后的字符串
      if (key === "aliases") {
        const curStr = JSON.stringify(
          Array.isArray(curVal) ? curVal : [],
        );
        const newStr = JSON.stringify(
          Array.isArray(newVal) ? newVal : [],
        );
        if (curStr !== newStr) {
          changes[key] = { old_value: curStr, new_value: newStr };
        }
        continue;
      }
      const curTrim = curVal == null ? "" : String(curVal).trim();
      const newTrim = newVal == null ? "" : String(newVal).trim();
      if (curTrim !== newTrim) {
        changes[key] = { old_value: curTrim, new_value: newTrim };
      }
    }
  }

  if (Object.keys(changes).length > 0) {
    const ts = Date.now();
    adminDb.saveTermHistory(id, changes, ts);
  }

  const result = adminDb.updateAdminTerm(id, filteredUpdates);
  adminDb.trimTermHistory(id, 30);

  markDirty();
  cache.invalidatePrefix("terms_");
  cache.invalidate(`term:${id}`, "graph_nodes", "stats_summary");
  return { id, changes: result.changes };
}

function getTermHistory(id) {
  return adminDb.getTermHistory(id, 100);
}

function deleteAdminTerm(id) {
  const result = adminDb.deleteAdminTerm(id);
  graphDb.deleteLinksByTermId(id);
  markDirty();
  cache.invalidatePrefix("terms_");
  cache.invalidate(
    `term:${id}`,
    "graph_nodes",
    "graph_links",
    "graph_data",
    "stats_summary",
  );
  return { id, changes: result.changes };
}

function getDisciplines() {
  return cache.remember("disciplines_admin", () => adminDb.getDisciplines());
}

function createDiscipline(data) {
  const { key, name, color, description } = data;

  if (!key || !name) {
    throw new Error("MISSING_FIELDS");
  }

  if (!/^[a-z_]+$/.test(key)) {
    throw new Error("INVALID_KEY");
  }

  try {
    const result = adminDb.createDiscipline(key, name, color, description);
    markDirty();
    cache.invalidate("disciplines", "disciplines_admin");
    const maxOrder = adminDb.getDisciplines().length;
    return {
      id: key,
      name,
      color: color || "#6B7B5E",
      description: description || "",
      display_order: maxOrder,
      changes: result.changes,
    };
  } catch (err) {
    if (err.message.includes("UNIQUE constraint failed")) {
      throw new Error("DUPLICATE_KEY");
    }
    throw err;
  }
}

function updateDisciplineOrder(order) {
  if (!Array.isArray(order)) {
    throw new Error("INVALID_ORDER");
  }

  adminDb.updateDisciplineOrder(order);
  markDirty();
  cache.invalidate("disciplines", "disciplines_admin");
  return { updated: order.length };
}

function updateDiscipline(id, updates) {
  const filteredUpdates = {};

  if (updates.name !== undefined) {
    filteredUpdates.name = updates.name;
  }
  if (updates.color !== undefined) {
    filteredUpdates.color = updates.color;
  }

  if (Object.keys(filteredUpdates).length === 0) {
    throw new Error("NO_FIELDS");
  }

  const result = adminDb.updateDiscipline(id, filteredUpdates);
  markDirty();
  cache.invalidate("disciplines", "disciplines_admin", "graph_nodes");
  return { id, changes: result.changes };
}

function deleteDiscipline(id) {
  const count = adminDb.countTermsByDiscipline(id);
  if (count > 0) {
    throw new Error(`HAS_TERMS:${count}`);
  }

  const result = adminDb.deleteDiscipline(id);
  markDirty();
  cache.invalidate("disciplines", "disciplines_admin");
  cache.invalidatePrefix("terms_");
  cache.invalidate("stats_summary");
  return { id, changes: result.changes };
}

function addGraphLink(sourceId, targetId, label) {
  const result = graphDb.addLink(sourceId, targetId, label);
  markDirty();
  cache.invalidate("graph_nodes", "graph_links");
  return { changes: result.changes };
}

function deleteGraphLink(sourceId, targetId) {
  const result = graphDb.deleteLink(sourceId, targetId);
  markDirty();
  cache.invalidate("graph_nodes", "graph_links");
  return { changes: result.changes };
}

function _exportTerms(discipline) {
  return adminDb.getAllTerms(discipline);
}

// 增强版：支持多维度筛选导出
function _exportTermsAdvanced(options) {
  return adminDb.getTermsForExport(options || {});
}

function termsToCsv(terms, fields) {
  const DEFAULT_FIELDS = [
    "id",
    "discipline",
    "name",
    "translation",
    "essence",
    "tip",
    "hot",
  ];
  const FIELD_LABELS_CN = {
    id: "词条ID",
    discipline: "学科",
    name: "术语名称",
    translation: "人话翻译",
    essence: "本质解释",
    tip: "防忽悠提示",
    hot: "热门标记",
  };
  const cols =
    Array.isArray(fields) && fields.length > 0 ? fields : DEFAULT_FIELDS;
  const header = cols.map((c) => FIELD_LABELS_CN[c] || c);

  const escape = (val) => {
    if (val === null || val === undefined) return "";
    let s = String(val);
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
  for (const term of terms) {
    const row = cols.map((c) => {
      if (c === "hot")
        return term.hot === 1 || term.hot === true || term.hot === "1"
          ? "是"
          : "否";
      return escape(term[c]);
    });
    rows.push(row.join(","));
  }
  return "\uFEFF" + rows.join("\r\n");
}

function parseCsvToTerms(text) {
  if (!text || typeof text !== "string") return [];
  const body = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const FIELD_LABELS_REVERSE = {
    词条ID: "id",
    学科: "discipline",
    术语名称: "name",
    人话翻译: "translation",
    本质解释: "essence",
    防忽悠提示: "tip",
    热门标记: "hot",
  };
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
  const headerCells = parseLine(lines[0]).map((c) => c.trim());
  const normalizedHeader = headerCells.map(
    (c) => FIELD_LABELS_REVERSE[c] || c.toLowerCase(),
  );
  const items = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseLine(lines[i]);
    if (cells.every((c) => !c || !c.trim())) continue;
    const obj = {};
    normalizedHeader.forEach((key, idx) => {
      const val = cells[idx] !== undefined ? cells[idx].trim() : "";
      if (key === "hot") {
        obj.hot =
          val === "是" ||
          val === "1" ||
          val.toLowerCase() === "true" ||
          val.toLowerCase() === "y" ||
          val === "热门";
      } else {
        obj[key] = val;
      }
    });
    items.push(obj);
  }
  return items;
}

function getDashboardStats() {
  return adminDb.getDashboardStats();
}

module.exports = {
  getAdminTerms,
  batchCreateTerms,
  updateAdminTerm,
  deleteAdminTerm,
  getTermsByDiscipline: (discipline) => adminDb.getAllTerms(discipline),
  termsToCsv,
  parseCsvToTerms,
  getDisciplines,
  createDiscipline,
  updateDisciplineOrder,
  updateDiscipline,
  deleteDiscipline,
  addGraphLink,
  deleteGraphLink,
  getDashboardStats,
  getTermHistory,
};
