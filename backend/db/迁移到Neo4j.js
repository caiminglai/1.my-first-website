require('dotenv').config();
const { getDb, initDB } = require('./入口');
const graphDb = require('./图数据库');

initDB();

async function migrateTerms() {
  console.log('开始迁移词条数据到 Neo4j...');
  const db = getDb();
  const terms = db.prepare('SELECT * FROM 词条').all();
  console.log(`共 ${terms.length} 条词条`);

  for (let i = 0; i < terms.length; i++) {
    const term = terms[i];
    await graphDb.createTermNode(term);
    if (term.学科) {
      await graphDb.createBelongsToRelation(term.词条ID, term.学科);
    }
    if (term.跨学科别名 && term.跨学科别名 !== '[]') {
      try {
        const aliases = JSON.parse(term.跨学科别名);
        for (const alias of aliases) {
          await graphDb.createCrossDisciplineAlias(term.词条ID, alias.discipline, alias.name);
        }
      } catch (e) {
        console.warn(`解析跨学科别名失败: ${term.词条ID}`, e.message);
      }
    }
    if ((i + 1) % 100 === 0) {
      console.log(`  已迁移 ${i + 1} 条`);
    }
  }
  console.log(`词条迁移完成: ${terms.length} 条`);
}

async function migrateDisciplines() {
  console.log('开始迁移学科数据...');
  const db = getDb();
  const disciplines = db.prepare('SELECT * FROM 学科').all();
  for (const d of disciplines) {
    await graphDb.createDisciplineNode(d);
  }
  console.log(`学科迁移完成: ${disciplines.length} 条`);
}

async function migrateRelations() {
  console.log('开始迁移图谱关系...');
  const db = getDb();
  const relations = db.prepare('SELECT * FROM 图谱关系').all();
  let count = 0;
  for (const rel of relations) {
    try {
      await graphDb.createRelatedToRelation(rel.源节点ID, rel.目标节点ID, rel.关系标签 || '');
      count++;
    } catch (e) {
      console.warn(`迁移关系失败: ${rel.源节点ID} -> ${rel.目标节点ID}`, e.message);
    }
  }
  console.log(`图谱关系迁移完成: ${count} 条`);
}

async function migrateCareers() {
  console.log('开始迁移职业解构数据...');
  const db = getDb();
  const careers = db.prepare('SELECT * FROM 职业解构').all();
  for (const c of careers) {
    await graphDb.createCareerNode(c);
  }
  console.log(`职业解构迁移完成: ${careers.length} 条`);
}

async function migrateIndustries() {
  console.log('开始迁移产业拆解数据...');
  const db = getDb();
  const industries = db.prepare('SELECT * FROM 产业拆解').all();
  for (const i of industries) {
    await graphDb.createIndustryNode(i);
  }
  console.log(`产业拆解迁移完成: ${industries.length} 条`);
}

async function main() {
  try {
    console.log('========================================');
    console.log('  SQLite -> Neo4j 数据迁移');
    console.log('========================================\n');

    await graphDb.createConstraints();
    console.log('约束创建完成\n');

    await migrateDisciplines();
    console.log();

    await migrateTerms();
    console.log();

    await migrateRelations();
    console.log();

    await migrateCareers();
    console.log();

    await migrateIndustries();
    console.log();

    const stats = await graphDb.getGraphStats();
    console.log('========================================');
    console.log('  迁移完成！图数据库统计：');
    console.log('========================================');
    console.log('节点:');
    for (const n of stats.nodeStats) {
      console.log(`  ${n.label}: ${n.count}`);
    }
    console.log('关系:');
    for (const r of stats.relStats) {
      console.log(`  ${r.type}: ${r.count}`);
    }
  } catch (e) {
    console.error('迁移失败:', e);
    process.exit(1);
  } finally {
    await graphDb.closeDriver();
  }
}

main();
