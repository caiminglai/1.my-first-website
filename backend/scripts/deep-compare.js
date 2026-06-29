/**
 * 深入对比岗位等表的差异
 */
const fs = require('fs');
const initSqlJs = require('sql.js');

const MAIN_DB = 'e:/website/1.my-first-website/data/tongwuyiming.db';
const COPY_DB = 'e:/website/1.my-first-website/data/tongwuyiming - 副本.db';

async function deepCompare() {
  const SQL = await initSqlJs();
  
  const mainBuf = fs.readFileSync(MAIN_DB);
  const mainDb = new SQL.Database(mainBuf);
  
  const copyBuf = fs.readFileSync(COPY_DB);
  const copyDb = new SQL.Database(copyBuf);
  
  const diffTables = ['岗位', '岗位学习资源', '岗位学习阶段', '岗位项目'];
  
  console.log('深入对比有差异的表...\n');
  
  for (const table of diffTables) {
    console.log(`=== ${table} ===`);
    
    // 获取列信息
    const mainColumns = mainDb.exec(`PRAGMA table_info("${table}")`);
    const copyColumns = copyDb.exec(`PRAGMA table_info("${table}")`);
    
    console.log(`主库列: ${mainColumns[0].values.map(v => v[1]).join(', ')}`);
    console.log(`副本列: ${copyColumns[0].values.map(v => v[1]).join(', ')}`);
    
    // 按主键排序获取数据
    const mainRows = mainDb.exec(`SELECT * FROM "${table}" ORDER BY 1`);
    const copyRows = copyDb.exec(`SELECT * FROM "${table}" ORDER BY 1`);
    
    const mainData = mainRows[0].values;
    const copyData = copyRows[0].values;
    
    // 找出不同的行
    let diffCount = 0;
    for (let i = 0; i < mainData.length && diffCount < 3; i++) {
      const mainStr = JSON.stringify(mainData[i]);
      const copyStr = JSON.stringify(copyData[i]);
      if (mainStr !== copyStr) {
        diffCount++;
        console.log(`\n第 ${i + 1} 行不同:`);
        console.log(`  主库: ${mainStr.substring(0, 150)}...`);
        console.log(`  副本: ${copyStr.substring(0, 150)}...`);
      }
    }
    
    if (diffCount === 0) {
      // 按rowid排序可能不一样，但按主键排序是一样的
      console.log('按主键排序后数据完全一致（差异只是rowid顺序不同）');
    }
    
    console.log('');
  }
  
  mainDb.close();
  copyDb.close();
}

deepCompare().catch(console.error);