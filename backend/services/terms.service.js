const termsDb = require("../db/terms");
const graphDb = require("../db/graph");
const { prepare, markDirty } = require("../db");
const cache = require("./cache");
const { parsePagination, validateString, validateId, validateEnum } = require("../utils/validator");
const { CACHE_KEYS, buildPageKey, buildCacheKey } = require("../utils/cacheKeys");

function getTerms(page = 1, pageSize = 50, discipline) {
  const safePage = Math.max(1, parseInt(page) || 1);
  const safePageSize = Math.min(1000, parseInt(pageSize) || 50);
  const key = buildPageKey(CACHE_KEYS.TERMS.LIST, safePage, safePageSize, discipline);
  return cache.remember(key, () =>
    termsDb.getTerms(safePage, safePageSize, discipline),
  );
}

function searchTerms(query, limit = 20) {
  if (!query || query.trim().length === 0) {
    throw new Error("MISSING_QUERY");
  }
  const safeLimit = Math.min(50, parseInt(limit) || 20);
  const key = buildCacheKey(CACHE_KEYS.TERMS.SEARCH, query.toLowerCase().trim(), safeLimit);
  const cached = cache.get(key);
  if (cached) return cached;
  const terms = termsDb.searchTerms(query, safeLimit);
  const result = {
    results: terms.map((t) => ({ term: t, score: 1, highlights: [] })),
    total: terms.length,
    query,
  };
  cache.set(key, result);
  return result;
}

function getRecentTerms(limit = 10) {
  const safeLimit = parseInt(limit) || 10;
  const key = buildCacheKey(CACHE_KEYS.TERMS.RECENT, safeLimit);
  return cache.remember(key, () => termsDb.getRecentTerms(safeLimit));
}

function getHotTerms() {
  return cache.remember(CACHE_KEYS.TERMS.HOT, () =>
    termsDb.getHotTerms().map((t) => ({ ...t, viewCount: 0 })),
  );
}

function getDisciplines() {
  return cache.remember(CACHE_KEYS.DISCIPLINES.LIST, () => termsDb.getDisciplines());
}

function getTermById(id) {
  const key = `term:${id}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const term = termsDb.getTermById(id);
  if (!term) {
    throw new Error("NOT_FOUND");
  }
  cache.set(key, term);
  return term;
}

function _findAliasTermId(aliasDiscipline, aliasName) {
  if (!aliasDiscipline || !aliasName) return null;
  const exact = prepare(
    "SELECT 词条ID as id FROM 词条 WHERE 学科 = ? AND 名称 = ? LIMIT 1",
  ).get(aliasDiscipline, aliasName);
  if (exact) return exact.id;
  const like = prepare(
    "SELECT 词条ID as id FROM 词条 WHERE 学科 = ? AND 名称 LIKE ? LIMIT 1",
  ).get(aliasDiscipline, `%${aliasName}%`);
  if (like) return like.id;
  return null;
}

function _addAliasLinks(termId, aliases) {
  if (!aliases || !Array.isArray(aliases) || aliases.length === 0) return;
  for (const alias of aliases) {
    if (!alias || !alias.discipline || !alias.name) continue;
    const aliasTermId = _findAliasTermId(alias.discipline, alias.name);
    if (!aliasTermId || aliasTermId === termId) continue;
    graphDb.addLink(termId, aliasTermId, "同物异名");
    graphDb.addLink(aliasTermId, termId, "同物异名");
  }
}

function createTerm(data) {
  const { id, discipline, name, translation, essence, tip, hot, aliases } = data;

  if (!id || !discipline || !name) {
    throw new Error("MISSING_FIELDS");
  }

  const result = termsDb.createTerm(
    id,
    discipline,
    name,
    translation,
    essence,
    tip,
    hot,
    aliases,
  );
  _addAliasLinks(id, aliases);
  markDirty();
  cache.invalidatePrefix("terms_");
  cache.invalidate("disciplines", `term:${id}`, "graph_nodes", "graph_links");
  return { id, changes: result.changes };
}

function updateTerm(id, updates) {
  const validFields = ["name", "translation", "essence", "tip", "hot", "aliases"];
  const filteredUpdates = {};

  for (const key of validFields) {
    if (updates[key] !== undefined) {
      filteredUpdates[key] = updates[key];
    }
  }

  if (Object.keys(filteredUpdates).length === 0) {
    throw new Error("NO_FIELDS");
  }

  const result = termsDb.updateTerm(id, filteredUpdates);

  if (filteredUpdates.aliases !== undefined) {
    graphDb.deleteLinksByTermId(id);
    _addAliasLinks(id, filteredUpdates.aliases);
  }

  markDirty();
  cache.invalidatePrefix("terms_");
  cache.invalidate(`term:${id}`, "graph_nodes", "graph_links");
  return { changes: result.changes };
}

function deleteTerm(id) {
  const result = termsDb.deleteTerm(id);
  graphDb.deleteLinksByTermId(id);
  markDirty();
  cache.invalidatePrefix("terms_");
  cache.invalidate(`term:${id}`, "graph_nodes", "graph_links", "graph_data");
  return { changes: result.changes };
}

function getRandomTerm(discipline) {
  const list = termsDb.getAllTerms(discipline);
  if (!list || list.length === 0) {
    return null;
  }
  const idx = Math.floor(Math.random() * list.length);
  return list[idx];
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
  getRandomTerm,
};
