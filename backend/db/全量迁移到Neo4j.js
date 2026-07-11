require('dotenv').config();
const { initDB, getDb } = require('./入口');
const graphDb = require('./图数据库');

initDB();
const db = getDb();

// 从学科子领域映射表读取映射关系
function loadMapping() {
  const rows = db.prepare('SELECT 子领域名称, 核心学科 FROM 学科子领域映射').all();
  const mapping = {};
  for (const row of rows) {
    mapping[row.子领域名称] = row.核心学科;
  }
  return mapping;
}

async function clearGraph() {
  console.log('清空Neo4j现有数据...');
  const s = graphDb.getSession();
  await s.run('MATCH (n) DETACH DELETE n');
  console.log('清空完成\n');
}

async function migrateDisciplines() {
  console.log('开始迁移学科数据...');
  const db = getDb();
  const disciplines = db.prepare('SELECT * FROM 学科').all();
  for (const d of disciplines) {
    await graphDb.createDisciplineNode(d);
  }
  console.log(`学科迁移完成: ${disciplines.length} 条\n`);
}

async function migrateCoreTerms() {
  console.log('开始迁移精选词条（已精加工）...');
  const db = getDb();
  const terms = db.prepare('SELECT * FROM 词条').all();
  for (let i = 0; i < terms.length; i++) {
    const term = terms[i];
    await graphDb.createTermNode(term);
    if (term.学科) {
      await graphDb.createBelongsToRelation(term.词条ID, term.学科);
    }
    if ((i + 1) % 200 === 0) console.log(`  已迁移 ${i + 1} 条`);
  }
  console.log(`精选词条迁移完成: ${terms.length} 条\n`);
}

async function migrateGraphRelations() {
  console.log('开始迁移图谱关系...');
  const db = getDb();
  const relations = db.prepare('SELECT * FROM 图谱关系').all();
  let count = 0;
  for (const rel of relations) {
    try {
      await graphDb.createRelatedToRelation(rel.源节点ID, rel.目标节点ID, rel.关系标签 || '');
      count++;
    } catch (e) {
      // 忽略单条失败
    }
  }
  console.log(`图谱关系迁移完成: ${count} 条\n`);
}

async function migrateConceptComparisons() {
  console.log('开始迁移概念对比...');
  const db = getDb();
  const comparisons = db.prepare('SELECT * FROM 概念对比').all();
  for (const c of comparisons) {
    await graphDb.createWordBankTermNode(c.A概念名称, c.A概念学科 || '', `cmp_a_${c.对比ID}`, 0);
    await graphDb.createWordBankTermNode(c.B概念名称, c.B概念学科 || '', `cmp_b_${c.对比ID}`, 0);
    // 创建对比关系
    const s = graphDb.getSession();
    await s.run(
      `MATCH (a:词条 {名称: $aName}), (b:词条 {名称: $bName})
       MERGE (a)-[:对比]->(b)`,
      { aName: c.A概念名称, bName: c.B概念名称 }
    );
  }
  console.log(`概念对比迁移完成: ${comparisons.length} 组\n`);
}

async function migrateWordBankTerms() {
  console.log('开始迁移词库词条（待精加工）...');
  const db = getDb();
  const 词库映射 = loadMapping();
  let total = 0;
  let totalInserted = 0;

  for (const [tableName, 核心学科] of Object.entries(词库映射)) {
    try {
      const rows = db.prepare(`SELECT * FROM "${tableName}"`).all();
      for (const row of rows) {
        const 词条ID = `wb_${tableName}_${row.id}`;
        await graphDb.createWordBankTermNode(row.词语, 核心学科, 词条ID, row.权重 || 0);
        const s = graphDb.getSession();
        await s.run(
          `MATCH (t:词条 {名称: $name}), (d:学科 {学科名称: $disc})
           MERGE (t)-[:属于]->(d)`,
          { name: row.词语, disc: 核心学科 }
        );
        totalInserted++;
      }
      total += rows.length;
      console.log(`  ${tableName} → ${核心学科}: ${rows.length} 条`);
    } catch (e) {
      console.log(`  ${tableName}: 读取失败 - ${e.message}`);
    }
  }
  console.log(`词库词条迁移完成: 共${total}条，导入${totalInserted}条\n`);
}

async function migrateSemanticRelations() {
  const db = getDb();

  // 同义关系
  console.log('开始迁移同义关系...');
  const synonyms = db.prepare('SELECT * FROM 同义关系').all();
  let synCount = 0;
  for (const r of synonyms) {
    try {
      await graphDb.createSynonymRelation(r.主词, r.同义词);
      synCount++;
    } catch (e) {}
  }
  console.log(`同义关系迁移完成: ${synCount} 条\n`);

  // 抽象关系
  console.log('开始迁移抽象关系...');
  const abstractions = db.prepare('SELECT * FROM 抽象关系').all();
  let absCount = 0;
  for (const r of abstractions) {
    try {
      await graphDb.createAbstractionRelation(r.具体词, r.上位概念);
      absCount++;
    } catch (e) {}
  }
  console.log(`抽象关系迁移完成: ${absCount} 条\n`);

  // 简称关系
  console.log('开始迁移简称关系...');
  const abbreviations = db.prepare('SELECT * FROM 简称关系').all();
  let abbrCount = 0;
  for (const r of abbreviations) {
    try {
      await graphDb.createAbbreviationRelation(r.全称, r.简称);
      abbrCount++;
    } catch (e) {}
  }
  console.log(`简称关系迁移完成: ${abbrCount} 条\n`);
}

async function main() {
  try {
    console.log('========================================');
    console.log('  SQLite → Neo4j 全量数据迁移');
    console.log('========================================\n');

    await graphDb.createConstraints();
    console.log('约束创建完成\n');

    await clearGraph();

    await migrateDisciplines();
    await migrateCoreTerms();
    await migrateGraphRelations();
    await migrateConceptComparisons();
    await migrateWordBankTerms();
    await migrateSemanticRelations();

    const stats = await graphDb.getGraphStats();
    console.log('========================================');
    console.log('  全量迁移完成！图数据库统计：');
    console.log('========================================');
    console.log('节点:');
    for (const n of stats.nodeStats) {
      console.log(`  ${n.label}: ${n.count}`);
    }
    console.log('关系:');
    for (const r of stats.relStats) {
      console.log(`  ${r.type}: ${r.count}`);
    }

    // 额外统计：已精加工 vs 待精加工
    const s = graphDb.getSession();
    const refinedResult = await s.run(
      `MATCH (t:词条) RETURN t.已精加工 as 已精加工, count(*) as count`
    );
    console.log('\n精加工状态:');
    for (const r of refinedResult.records) {
      const status = r.get('已精加工');
      const count = r.get('count').toNumber();
      console.log(`  ${status === true ? '已精加工' : '待精加工'}: ${count}`);
    }
  } catch (e) {
    console.error('迁移失败:', e);
    process.exit(1);
  } finally {
    await graphDb.closeDriver();
  }
}

main();
