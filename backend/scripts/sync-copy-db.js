/**
 * 从主库复制用户提交表到副本
 */
const fs = require('fs');
const initSqlJs = require('sql.js');

const MAIN_DB_PATH = 'e:/website/1.my-first-website/data/tongwuyiming.db';
const COPY_DB_PATH = 'e:/website/1.my-first-website/data/tongwuyiming - 副本.db';

async function syncMissingTable() {
  console.log('同步缺失的表到副本数据库...\n');
  const SQL = await initSqlJs();
  
  const mainBuffer = fs.readFileSync(MAIN_DB_PATH);
  const mainDb = new SQL.Database(mainBuffer);
  
  const copyBuffer = fs.readFileSync(COPY_DB_PATH);
  const copyDb = new SQL.Database(copyBuffer);
  
  // 找出主库有但副本没有的表
  const mainResult = mainDb.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
  const mainTables = mainResult.length > 0 ? mainResult[0].values.map(v => v[0]) : [];
  
  const copyResult = copyDb.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
  const copyTables = copyResult.length > 0 ? copyResult[0].values.map(v => v[0]) : [];
  
  const missingTables = mainTables.filter(t => !copyTables.includes(t));
  
  console.log(`缺失 ${missingTables.length} 个表: ${missingTables.join(', ')}`);
  
  for (const table of missingTables) {
    console.log(`\n正在复制表: ${table}`);
    
    // 获取建表SQL
    const schemaResult = mainDb.exec(`SELECT sql FROM sqlite_master WHERE type='table' AND name='${table}'`);
    if (schemaResult.length === 0 || schemaResult[0].values.length === 0) {
      console.log(`  ✗ 无法获取表结构`);
      continue;
    }
    
    const createSql = schemaResult[0].values[0][0];
    console.log(`  建表SQL: ${createSql.substring(0, 100)}...`);
    
    // 创建表
    try {
      copyDb.exec(createSql);
      console.log(`  ✓ 表已创建`);
    } catch (e) {
      console.log(`  ✗ 创建失败: ${e.message}`);
      continue;
    }
    
    // 复制数据
    try {
      const dataResult = mainDb.exec(`SELECT * FROM "${table}"`);
      if (dataResult.length > 0 && dataResult[0].values.length > 0) {
        const columns = dataResult[0].columns;
        const rows = dataResult[0].values;
        
        console.log(`  共 ${rows.length} 条数据`);
        
        for (const row of rows) {
          const placeholders = columns.map(() => '?').join(', ');
          const stmt = copyDb.prepare(`INSERT INTO "${table}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${placeholders})`);
          stmt.bind(row);
          stmt.step();
          stmt.free();
        }
        
        console.log(`  ✓ 数据已复制`);
      } else {
        console.log(`  (空表，无数据)`);
      }
    } catch (e) {
      console.log(`  ✗ 数据复制失败: ${e.message}`);
    }
    
    // 复制索引
    try {
      const indexResult = mainDb.exec(`SELECT sql FROM sqlite_master WHERE type='index' AND tbl_name='${table}' AND sql IS NOT NULL`);
      if (indexResult.length > 0 && indexResult[0].values.length > 0) {
        for (const indexSql of indexResult[0].values) {
          copyDb.exec(indexSql[0]);
        }
        console.log(`  ✓ 索引已复制`);
      }
    } catch (e) {
      console.log(`  ✗ 索引复制失败: ${e.message}`);
    }
  }
  
  // 保存副本数据库
  const data = copyDb.export();
  const buf = Buffer.from(data.buffer || data, data.byteOffset || 0, data.byteLength || data.length);
  fs.writeFileSync(COPY_DB_PATH, buf);
  console.log('\n已保存修改后的副本数据库');
  
  // 再次验证
  const verifyResult = copyDb.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
  const verifyTables = verifyResult.length > 0 ? verifyResult[0].values.map(v => v[0]) : [];
  
  console.log(`\n验证: 副本现在有 ${verifyTables.length} 个表`);
  
  const stillMissing = mainTables.filter(t => !verifyTables.includes(t));
  if (stillMissing.length === 0) {
    console.log('✓ 所有表已同步完成');
  } else {
    console.log(`✗ 仍缺失: ${stillMissing.join(', ')}`);
  }
  
  mainDb.close();
  copyDb.close();
}

syncMissingTable().catch(console.error);