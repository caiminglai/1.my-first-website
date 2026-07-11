const graphDb = require('../db/图数据库');

async function getStats() {
  return await graphDb.getGraphStats();
}

async function findPath(startId, endId) {
  const path = await graphDb.findShortestPath(startId, endId);
  if (!path) return null;
  return path;
}

async function getNeighbors(termId, depth = 1) {
  return await graphDb.getNeighbors(termId, depth);
}

async function search(keyword, limit = 20) {
  return await graphDb.searchByKeyword(keyword, limit);
}

async function getGraphData() {
  const cypher = `
    MATCH (n)-[r]->(m)
    RETURN n, r, m
    LIMIT 500
  `;
  const results = await graphDb.runCypher(cypher);
  const nodes = new Map();
  const links = [];

  for (const row of results) {
    const n = row.n;
    const m = row.m;
    const r = row.r;

    if (!nodes.has(n.identity.toString())) {
      nodes.set(n.identity.toString(), {
        id: n.identity.toString(),
        label: n.labels[0],
        properties: n.properties
      });
    }
    if (!nodes.has(m.identity.toString())) {
      nodes.set(m.identity.toString(), {
        id: m.identity.toString(),
        label: m.labels[0],
        properties: m.properties
      });
    }

    links.push({
      source: n.identity.toString(),
      target: m.identity.toString(),
      type: r.type,
      properties: r.properties
    });
  }

  return {
    nodes: Array.from(nodes.values()),
    links
  };
}

async function executeQuery(query) {
  return await graphDb.runCypher(query);
}

module.exports = {
  getStats,
  findPath,
  getNeighbors,
  search,
  getGraphData,
  executeQuery
};
