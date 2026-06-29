/**
 * 验证主库和副本是否一致
 */
const fs = require('fs');
const initSqlJs = require('sql.js');

const MAIN_DB_PATH = 'e:/website/1.my-first-website/data/tongwuyiming.db';
const COPY_DB_PATH = 'e:/website/1.my-first-website/data/tongwuyiming - 副本.db';

async function verify() {
  console.log('正在验证主库和副本的一致性...\n');
  const SQL = await initSqlJs();
  
  const mainBuffer = fs.readFileSync(MAIN_DB_PATH);
  const mainDb = new SQL.Database(mainBuffer);
  
  const copyBuffer = fs.readFileSync(COPY_DB_PATH);
  const copyDb = new SQL.Database(copyBuffer);
  
  // 获取表列表
  const mainResult = mainDb.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
  const mainTables = mainResult.length > 0 ? mainResult[0].values.map(v => v[0]) : [];
  
  const copyResult = copyDb.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
  const copyTables = copyResult.length > 0 ? copyResult[0].values.map(v => v[0]) : [];
  
  console.log('表结构对比:');
  console.log(`  主库表数: ${mainTables.length}`);
  console.log(`  副本表数: ${copyTables.length}`);
  
  // 找出差异
  const mainOnly = mainTables.filter(t => !copyTables.includes(t));
  const copyOnly = copyTables.filter(t => !mainTables.includes(t));
  
  if (mainOnly.length === 0 && copyOnly.length === 0) {
    console.log('  ✓ 表结构完全一致\n');
  } else {
    if (mainOnly.length > 0) {
      console.log(`  主库独有表: ${mainOnly.join(', ')}`);
    }
    if (copyOnly.length > 0) {
      console.log(`  副本独有表: ${copyOnly.join(', ')}`);
    }
    console.log('');
  }
  
  // 对比数据量
  console.log('数据量对比:');
  console.log('| 表名 | 主库 | 副本 | 一致 |');
  console.log('|-----|-----|------|-----|');
  
  let allMatch = true;
  
  for (const table of mainTables) {
    if (!copyTables.includes(table)) continue;
    
    const mainCount = mainDb.exec(`SELECT COUNT(*) FROM "${table}"`)[0].values[0][0];
    const copyCount = copyDb.exec(`SELECT COUNT(*) FROM "${table}"`)[0].values[0][0];
    const match = mainCount === copyCount;
    if (!match) allMatch = false;
    
    console.log(`| ${table} | ${mainCount} | ${copyCount} | ${match ? '✓' : '✗'} |`);
  }
  
  console.log('');
  if (allMatch && mainTables.length === copyTables.length) {
    console.log('✓ 主库与副本数据完全一致!');
  } else {
    console.log('✗ 主库与副本存在差异');
  }
  
  mainDb.close();
  copyDb.close();
}

verify().catch(console.error);