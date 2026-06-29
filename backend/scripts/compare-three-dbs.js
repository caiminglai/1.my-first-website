/**
 * 精确对比三个数据库的一致性
 */
const fs = require('fs');
const crypto = require('crypto');
const initSqlJs = require('sql.js');

const MAIN_DB = 'e:/website/1.my-first-website/data/tongwuyiming.db';
const COPY_DB = 'e:/website/1.my-first-website/data/tongwuyiming - 副本.db';
const BACKUP_DB = 'e:/website/1.my-first-website/data/backups/tongwuyiming_20260629_133736.db';

const DB_NAMES = {
  [MAIN_DB]: '主库(tongwuyiming.db)',
  [COPY_DB]: '副本(tongwuyiming - 副本.db)',
  [BACKUP_DB]: '备份(tongwuyiming_20260629_133736.db)',
};

function md5File(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex');
}

async function compareAll() {
  console.log('正在对比三个数据库的一致性...\n');
  const SQL = await initSqlJs();
  
  // 1. 文件级对比
  console.log('=== 1. 文件级对比 ===\n');
  
  console.log('| 数据库 | 文件大小 | MD5哈希 |');
  console.log('|-------|---------|---------|');
  
  const fileHashes = {};
  for (const dbPath of [MAIN_DB, COPY_DB, BACKUP_DB]) {
    const stat = fs.statSync(dbPath);
    const hash = md5File(dbPath);
    fileHashes[dbPath] = hash;
    console.log(`| ${DB_NAMES[dbPath]} | ${(stat.size / 1024).toFixed(2)} KB | ${hash} |`);
  }
  
  // 判断文件是否完全相同
  const uniqueHashes = new Set(Object.values(fileHashes));
  console.log(`\n文件二进制完全一致: ${uniqueHashes.size === 1 ? '✓ 是' : '✗ 否'}`);
  
  // 2. 表结构对比
  console.log('\n=== 2. 表结构对比 ===\n');
  
  const dbInfos = {};
  
  for (const dbPath of [MAIN_DB, COPY_DB, BACKUP_DB]) {
    const buffer = fs.readFileSync(dbPath);
    const db = new SQL.Database(buffer);
    
    const tableResult = db.exec("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
    const tables = tableResult.length > 0 ? tableResult[0].values : [];
    
    const tableMap = {};
    for (const [name, sql] of tables) {
      tableMap[name] = sql;
    }
    
    // 获取所有索引
    const indexResult = db.exec("SELECT name, sql, tbl_name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' ORDER BY name");
    const indexes = indexResult.length > 0 ? indexResult[0].values : [];
    
    dbInfos[dbPath] = {
      tableCount: tables.length,
      tableNames: Object.keys(tableMap),
      tableMap: tableMap,
      indexes: indexes,
      db: db,
    };
  }
  
  console.log('| 项目 | 主库 | 副本 | 备份 | 一致 |');
  console.log('|-----|------|------|------|-----|');
  
  const mainInfo = dbInfos[MAIN_DB];
  const copyInfo = dbInfos[COPY_DB];
  const backupInfo = dbInfos[BACKUP_DB];
  
  console.log(`| 表数量 | ${mainInfo.tableCount} | ${copyInfo.tableCount} | ${backupInfo.tableCount} | ${mainInfo.tableCount === copyInfo.tableCount && copyInfo.tableCount === backupInfo.tableCount ? '✓' : '✗'} |`);
  
  // 表名对比
  const allTableNames = new Set([...mainInfo.tableNames, ...copyInfo.tableNames, ...backupInfo.tableNames]);
  console.log(`\n表名一致性:`);
  
  let allTablesMatch = true;
  for (const tableName of allTableNames) {
    const inMain = mainInfo.tableNames.includes(tableName);
    const inCopy = copyInfo.tableNames.includes(tableName);
    const inBackup = backupInfo.tableNames.includes(tableName);
    
    if (!(inMain && inCopy && inBackup)) {
      allTablesMatch = false;
      console.log(`  ✗ ${tableName}: 主库${inMain ? '✓' : '✗'} 副本${inCopy ? '✓' : '✗'} 备份${inBackup ? '✓' : '✗'}`);
    }
  }
  
  if (allTablesMatch) {
    console.log('  ✓ 所有表名完全一致');
  }
  
  // 3. 表结构(SQL)对比
  console.log('\n表结构一致性:');
  
  let allSchemasMatch = true;
  for (const tableName of mainInfo.tableNames) {
    if (!copyInfo.tableMap[tableName] || !backupInfo.tableMap[tableName]) continue;
    
    const mainSql = mainInfo.tableMap[tableName];
    const copySql = copyInfo.tableMap[tableName];
    const backupSql = backupInfo.tableMap[tableName];
    
    if (mainSql !== copySql || copySql !== backupSql) {
      allSchemasMatch = false;
      console.log(`  ✗ ${tableName}: 结构不一致`);
    }
  }
  
  if (allSchemasMatch) {
    console.log('  ✓ 所有表结构完全一致');
  }
  
  // 4. 数据量对比
  console.log('\n=== 3. 数据量对比 ===\n');
  
  console.log('| 表名 | 主库行数 | 副本行数 | 备份行数 | 一致 |');
  console.log('|-----|---------|---------|---------|-----|');
  
  let allCountsMatch = true;
  
  for (const tableName of mainInfo.tableNames.sort()) {
    const mainCount = mainInfo.db.exec(`SELECT COUNT(*) FROM "${tableName}"`)[0].values[0][0];
    const copyCount = copyInfo.db.exec(`SELECT COUNT(*) FROM "${tableName}"`)[0].values[0][0];
    const backupCount = backupInfo.db.exec(`SELECT COUNT(*) FROM "${tableName}"`)[0].values[0][0];
    
    const match = mainCount === copyCount && copyCount === backupCount;
    if (!match) allCountsMatch = false;
    
    console.log(`| ${tableName} | ${mainCount} | ${copyCount} | ${backupCount} | ${match ? '✓' : '✗'} |`);
  }
  
  // 5. 数据内容一致性（抽样检查）
  console.log('\n=== 4. 数据内容一致性（MD5校验和） ===\n');
  
  console.log('| 表名 | 主库MD5 | 副本MD5 | 备份MD5 | 一致 |');
  console.log('|-----|---------|---------|---------|-----|');
  
  let allDataMatch = true;
  
  for (const tableName of mainInfo.tableNames.sort()) {
    // 获取所有数据的有序字符串，计算MD5
    const mainRows = mainInfo.db.exec(`SELECT * FROM "${tableName}" ORDER BY rowid`);
    const copyRows = copyInfo.db.exec(`SELECT * FROM "${tableName}" ORDER BY rowid`);
    const backupRows = backupInfo.db.exec(`SELECT * FROM "${tableName}" ORDER BY rowid`);
    
    const mainStr = mainRows.length > 0 ? JSON.stringify(mainRows[0].values) : 'empty';
    const copyStr = copyRows.length > 0 ? JSON.stringify(copyRows[0].values) : 'empty';
    const backupStr = backupRows.length > 0 ? JSON.stringify(backupRows[0].values) : 'empty';
    
    const mainMd5 = crypto.createHash('md5').update(mainStr).digest('hex').substring(0, 12);
    const copyMd5 = crypto.createHash('md5').update(copyStr).digest('hex').substring(0, 12);
    const backupMd5 = crypto.createHash('md5').update(backupStr).digest('hex').substring(0, 12);
    
    const match = mainMd5 === copyMd5 && copyMd5 === backupMd5;
    if (!match) allDataMatch = false;
    
    console.log(`| ${tableName} | ${mainMd5} | ${copyMd5} | ${backupMd5} | ${match ? '✓' : '✗'} |`);
  }
  
  // 6. 总结
  console.log('\n=== 5. 总结 ===\n');
  
  const fullyIdentical = uniqueHashes.size === 1;
  const dataIdentical = allCountsMatch && allDataMatch && allTablesMatch && allSchemasMatch;
  
  console.log(`文件二进制完全相同: ${fullyIdentical ? '✓ 是' : '✗ 否'}`);
  console.log(`表结构完全相同: ${allTablesMatch && allSchemasMatch ? '✓ 是' : '✗ 否'}`);
  console.log(`数据量完全相同: ${allCountsMatch ? '✓ 是' : '✗ 否'}`);
  console.log(`数据内容完全相同: ${allDataMatch ? '✓ 是' : '✗ 否'}`);
  console.log(`整体逻辑一致: ${dataIdentical ? '✓ 是' : '✗ 否'}`);
  
  if (fullyIdentical) {
    console.log('\n✅ 三个数据库文件完全相同（二进制级别一致）');
  } else if (dataIdentical) {
    console.log('\n✅ 三个数据库的数据内容完全一致（文件不同但逻辑等价）');
  } else {
    console.log('\n❌ 三个数据库存在差异');
  }
  
  // 关闭数据库
  for (const info of Object.values(dbInfos)) {
    info.db.close();
  }
}

compareAll().catch(console.error);