const neo4j = require('neo4j-driver');

const NEO4J_URI = process.env.NEO4J_URI || 'bolt://localhost:7687';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || '';

let driver = null;
let session = null;

function getDriver() {
  if (!driver) {
    driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
  }
  return driver;
}

function getSession() {
  if (!session) {
    session = getDriver().session();
  }
  return session;
}

async function closeDriver() {
  if (session) {
    await session.close();
    session = null;
  }
  if (driver) {
    await driver.close();
    driver = null;
  }
}

async function createConstraints() {
  const s = getSession();
  await s.run('CREATE CONSTRAINT IF NOT EXISTS FOR (t:词条) REQUIRE t.词条ID IS UNIQUE');
  await s.run('CREATE CONSTRAINT IF NOT EXISTS FOR (d:学科) REQUIRE d.学科名称 IS UNIQUE');
  await s.run('CREATE CONSTRAINT IF NOT EXISTS FOR (p:职业) REQUIRE p.职业ID IS UNIQUE');
  await s.run('CREATE CONSTRAINT IF NOT EXISTS FOR (i:产业) REQUIRE i.产业ID IS UNIQUE');
  await s.run('CREATE CONSTRAINT IF NOT EXISTS FOR (j:岗位) REQUIRE j.岗位ID IS UNIQUE');
}

async function createTermNode(term) {
  const s = getSession();
  const result = await s.run(
    `MERGE (t:词条 {词条ID: $词条ID})
     SET t.名称 = $名称,
         t.学科 = $学科,
         t.翻译 = $翻译,
         t.本质 = $本质,
         t.提示 = $提示,
         t.热度 = $热度,
         t.已精加工 = true
     RETURN t`,
    {
      词条ID: term.词条ID,
      名称: term.名称,
      学科: term.学科,
      翻译: term.翻译 || '',
      本质: term.本质 || '',
      提示: term.提示 || '',
      热度: term.热度 || 0
    }
  );
  return result.records[0]?.get('t').properties;
}

/**
 * 创建词库词条节点（待精加工）
 * MERGE by 名称，如果已存在精加工词条则只补充学科归属
 */
async function createWordBankTermNode(名称, 学科, 词条ID, 权重) {
  const s = getSession();
  const result = await s.run(
    `MERGE (t:词条 {名称: $名称})
     SET t.词条ID = COALESCE(t.词条ID, $词条ID),
         t.学科 = COALESCE(t.学科, $学科),
         t.权重 = COALESCE(t.权重, $权重),
         t.已精加工 = COALESCE(t.已精加工, false)
     RETURN t`,
    { 名称, 学科, 词条ID, 权重: 权重 || 0 }
  );
  return result.records[0]?.get('t').properties;
}

async function createDisciplineNode(discipline) {
  const s = getSession();
  const result = await s.run(
    `MERGE (d:学科 {学科名称: $学科名称})
     SET d.学科颜色 = $学科颜色,
         d.学科描述 = $学科描述,
         d.显示顺序 = $显示顺序
     RETURN d`,
    {
      学科名称: discipline.学科名称,
      学科颜色: discipline.学科颜色 || '#6B7B5E',
      学科描述: discipline.学科描述 || '',
      显示顺序: discipline.显示顺序 || 0
    }
  );
  return result.records[0]?.get('d').properties;
}

async function createBelongsToRelation(termId, disciplineName) {
  const s = getSession();
  await s.run(
    `MATCH (t:词条 {词条ID: $termId})
     MATCH (d:学科 {学科名称: $disciplineName})
     MERGE (t)-[:属于]->(d)`,
    { termId, disciplineName }
  );
}

async function createRelatedToRelation(sourceId, targetId, label = '') {
  const s = getSession();
  await s.run(
    `MATCH (a:词条 {词条ID: $sourceId})
     MATCH (b:词条 {词条ID: $targetId})
     MERGE (a)-[r:关联 {关系标签: $label}]->(b)`,
    { sourceId, targetId, label }
  );
}

async function createCrossDisciplineAlias(termId, aliasDiscipline, aliasName) {
  const s = getSession();
  await s.run(
    `MATCH (t:词条 {词条ID: $termId})
     MERGE (a:别名 {名称: $aliasName, 学科: $aliasDiscipline})
     MERGE (t)-[:别名]->(a)`,
    { termId, aliasDiscipline, aliasName }
  );
}

/**
 * 创建同义关系（按名称匹配两端节点）
 */
async function createSynonymRelation(主词, 同义词) {
  const s = getSession();
  await s.run(
    `MERGE (a:词条 {名称: $主词})
     MERGE (b:词条 {名称: $同义词})
     MERGE (a)-[:同义]->(b)`,
    { 主词, 同义词 }
  );
}

/**
 * 创建简称关系（全称 → 简称）
 */
async function createAbbreviationRelation(全称, 简称) {
  const s = getSession();
  await s.run(
    `MERGE (a:词条 {名称: $全称})
     MERGE (b:词条 {名称: $简称})
     MERGE (a)-[:简称]->(b)`,
    { 全称, 简称 }
  );
}

/**
 * 创建抽象关系（具体词 → 上位概念）
 */
async function createAbstractionRelation(具体词, 上位概念) {
  const s = getSession();
  await s.run(
    `MERGE (a:词条 {名称: $具体词})
     MERGE (b:词条 {名称: $上位概念})
     MERGE (a)-[:属于抽象]->(b)`,
    { 具体词, 上位概念 }
  );
}

async function createCareerNode(career) {
  const s = getSession();
  const result = await s.run(
    `MERGE (p:职业 {职业ID: $职业ID})
     SET p.职业名称 = $职业名称,
         p.职业类别 = $职业类别,
         p.薪资范围 = $薪资范围,
         p.学历要求 = $学历要求,
         p.学习时长 = $学习时长,
         p.职业描述 = $职业描述
     RETURN p`,
    {
      职业ID: career.职业ID,
      职业名称: career.职业名称,
      职业类别: career.职业类别,
      薪资范围: career.薪资范围 || '',
      学历要求: career.学历要求 || '',
      学习时长: career.学习时长 || '',
      职业描述: career.职业描述
    }
  );
  return result.records[0]?.get('p').properties;
}

async function createIndustryNode(industry) {
  const s = getSession();
  const result = await s.run(
    `MERGE (i:产业 {产业ID: $产业ID})
     SET i.产业名称 = $产业名称,
         i.产业描述 = $产业描述,
         i.核心描述 = $核心描述
     RETURN i`,
    {
      产业ID: industry.产业ID,
      产业名称: industry.产业名称,
      产业描述: industry.产业描述,
      核心描述: industry.核心描述 || ''
    }
  );
  return result.records[0]?.get('i').properties;
}

async function findShortestPath(startId, endId) {
  const s = getSession();
  const result = await s.run(
    `MATCH (start:词条 {词条ID: $startId}), (end:词条 {词条ID: $endId})
     MATCH path = shortestPath((start)-[*1..6]-(end))
     RETURN path`,
    { startId, endId }
  );
  if (result.records.length === 0) return null;
  const path = result.records[0].get('path');
  return {
    nodes: path.nodes.map(n => n.properties),
    relationships: path.relationships.map(r => ({
      type: r.type,
      properties: r.properties
    }))
  };
}

async function getNeighbors(termId, depth = 1) {
  const s = getSession();
  const result = await s.run(
    `MATCH (t:词条 {词条ID: $termId})-[*1..${depth}]-(neighbor)
     RETURN DISTINCT neighbor`,
    { termId }
  );
  return result.records.map(r => r.get('neighbor').properties);
}

async function searchByKeyword(keyword, limit = 20) {
  const s = getSession();
  const result = await s.run(
    `MATCH (t:词条)
     WHERE t.名称 CONTAINS $keyword OR t.翻译 CONTAINS $keyword OR t.本质 CONTAINS $keyword
     RETURN t
     LIMIT $limit`,
    { keyword, limit: neo4j.int(limit) }
  );
  return result.records.map(r => r.get('t').properties);
}

async function getGraphStats() {
  const s = getSession();
  const result = await s.run(`
    MATCH (n)
    WITH labels(n)[0] as label, count(*) as count
    RETURN label, count
    ORDER BY count DESC
  `);
  const nodeStats = result.records.map(r => ({
    label: r.get('label'),
    count: r.get('count').toNumber()
  }));

  const relResult = await s.run(`
    MATCH ()-[r]->()
    WITH type(r) as relType, count(*) as count
    RETURN relType, count
    ORDER BY count DESC
  `);
  const relStats = relResult.records.map(r => ({
    type: r.get('relType'),
    count: r.get('count').toNumber()
  }));

  return { nodeStats, relStats };
}

async function runCypher(query, params = {}) {
  const s = getSession();
  const result = await s.run(query, params);
  return result.records.map(r => r.toObject());
}

module.exports = {
  getDriver,
  getSession,
  closeDriver,
  createConstraints,
  createTermNode,
  createWordBankTermNode,
  createDisciplineNode,
  createBelongsToRelation,
  createRelatedToRelation,
  createCrossDisciplineAlias,
  createSynonymRelation,
  createAbbreviationRelation,
  createAbstractionRelation,
  createCareerNode,
  createIndustryNode,
  findShortestPath,
  getNeighbors,
  searchByKeyword,
  getGraphStats,
  runCypher
};
