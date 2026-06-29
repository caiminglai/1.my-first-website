/**
 * 检查并清理副本数据库中的残留英文表
 */
const fs = require('fs');
const initSqlJs = require('sql.js');

const COPY_DB_PATH = 'e:/website/1.my-first-website/data/tongwuyiming - 副本.db';

// 英文表名列表（迁移前的旧表名）
const ENGLISH_TABLES = [
  'terms',
  'disciplines',
  'graph_links',
  'comparisons',
  'scenarios',
  'scenario_dialogues',
  'feedback',
  'submissions',
  'term_history',
  'learning_paths',
  'concept_antibodies',
  'career_deconstruction',
  'career_stages',
  'career_skills',
  'career_resources',
  'career_projects',
  'industry_deconstruction',
  'industry_links',
  'industry_roles',
  'job_categories',
  'jobs',
  'job_stages',
  'job_skills',
  'job_resources',
  'job_projects',
  'knowledge_cards',
  'industry_jobs',
  'job_learning_stages',
  'job_knowledge_cards',
];

async function checkAndClean() {
  console.log('正在初始化 sql.js...');
  const SQL = await initSqlJs();
  
  if (!fs.existsSync(COPY_DB_PATH)) {
    console.log('副本数据库文件不存在');
    return;
  }
  
  const buffer = fs.readFileSync(COPY_DB_PATH);
  const db = new SQL.Database(buffer);
  
  // 获取所有表名
  const tableResult = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
  const allTables = tableResult.length > 0 ? tableResult[0].values.map(v => v[0]) : [];
  
  console.log('\n副本数据库所有表:');
  console.log(allTables.join(', '));
  
  // 找出残留的英文表
  const residualEnglishTables = allTables.filter(t => ENGLISH_TABLES.includes(t));
  
  console.log(`\n找到 ${residualEnglishTables.length} 个残留英文表:`);
  if (residualEnglishTables.length > 0) {
    residualEnglishTables.forEach(t => console.log(`  - ${t}`));
  } else {
    console.log('  没有残留英文表');
  }
  
  // 找出中文表
  const chineseTables = allTables.filter(t => !ENGLISH_TABLES.includes(t));
  console.log(`\n中文表数量: ${chineseTables.length}`);
  
  // 如果有残留英文表，删除它们
  if (residualEnglishTables.length > 0) {
    console.log('\n开始删除残留英文表...');
    
    // 先备份原文件
    const backupPath = COPY_DB_PATH.replace('.db', '_before_clean_' + Date.now() + '.db');
    fs.copyFileSync(COPY_DB_PATH, backupPath);
    console.log(`已备份原文件到: ${backupPath}`);
    
    // 删除英文表
    for (const table of residualEnglishTables) {
      try {
        db.exec(`DROP TABLE IF EXISTS "${table}"`);
        console.log(`  ✓ 已删除表: ${table}`);
      } catch (e) {
        console.log(`  ✗ 删除表 ${table} 失败: ${e.message}`);
      }
    }
    
    // 保存修改后的数据库
    const data = db.export();
    const buf = Buffer.from(data.buffer || data, data.byteOffset || 0, data.byteLength || data.length);
    fs.writeFileSync(COPY_DB_PATH, buf);
    console.log('\n已保存修改后的数据库');
    
    // 再次验证
    const verifyResult = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
    const verifyTables = verifyResult.length > 0 ? verifyResult[0].values.map(v => v[0]) : [];
    const remainingEnglish = verifyTables.filter(t => ENGLISH_TABLES.includes(t));
    
    console.log(`\n验证: 剩余 ${verifyTables.length} 个表`);
    if (remainingEnglish.length === 0) {
      console.log('✓ 所有英文表已清理完成');
    } else {
      console.log(`✗ 仍有 ${remainingEnglish.length} 个英文表: ${remainingEnglish.join(', ')}`);
    }
  } else {
    console.log('\n副本数据库无需清理，已经是纯中文表');
  }
  
  db.close();
}

checkAndClean().catch(console.error);