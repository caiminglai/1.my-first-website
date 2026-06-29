/**
 * 数据库对比脚本 - 使用 sql.js 对比多个数据库文件
 */
const fs = require('fs');
const initSqlJs = require('sql.js');

// 数据库文件列表
const dbFiles = [
  { path: 'e:/website/1.my-first-website/data/tongwuyiming.db', name: '主库(当前)' },
  { path: 'e:/website/1.my-first-website/data/tongwuyiming - 副本.db', name: '副本' },
  { path: 'e:/website/1.my-first-website/data/backups/tongwuyiming_20260629_133736.db', name: 'backup_20260629' },
  { path: 'e:/website/1.my-first-website/data/backups/tongwuyiming_before_chinese_1782712952572.db', name: 'before_chinese_1' },
  { path: 'e:/website/1.my-first-website/data/backups/tongwuyiming_before_chinese_1782712982037.db', name: 'before_chinese_2' },
  { path: 'e:/website/1.my-first-website/data/backups/tongwuyiming_before_complete_migration_2026-06-28T08-53-36.db', name: 'before_complete' },
  { path: 'e:/website/1.my-first-website/data/backups/tongwuyiming_before_fix_1782720345509.db', name: 'before_fix' },
  { path: 'e:/website/1.my-first-website/data/backups/tongwuyiming_before_full_migration_2026-06-27T22-33-18.db', name: 'before_full_migration' },
  { path: 'e:/website/1.my-first-website/data/backups/tongwuyiming_before_job_migration_2026-06-27T22-29-22.db', name: 'before_job_1' },
  { path: 'e:/website/1.my-first-website/data/backups/tongwuyiming_before_job_migration_final_2026-06-27T22-43-08.db', name: 'before_job_final' },
  { path: 'e:/website/1.my-first-website/data/backups/tongwuyiming_before_migration_v2_2026-06-27T22-34-36.db', name: 'before_migration_v2' },
  { path: 'e:/website/1.my-first-website/data/backups/tongwuyiming_corrupted_1782712264838.db', name: 'corrupted' },
  { path: 'e:/website/1.my-first-website/data/backups/tongwuyiming_final_fix_1782720921655.db', name: 'final_fix' },
];

// 中文表名列表
const chineseTables = ['词条', '学科', '图谱关系', '概念对比', '情景还原', '情景对话', '用户反馈', '用户提交', '词条历史', '学习路径', '概念抗体', '职业解构', '职业阶段', '职业技能', '职业资源', '职业项目', '产业拆解', '产业链环节', '产业岗位', '岗位分类', '岗位', '岗位学习阶段', '岗位技能', '岗位学习资源', '岗位项目', '岗位知识卡片'];
// 英文表名列表
const englishTables = ['terms', 'disciplines', 'graph_links', 'comparisons', 'scenarios', 'scenario_dialogues', 'feedback', 'submissions', 'term_history', 'learning_paths', 'concept_antibodies', 'career_deconstruction', 'career_stages', 'career_skills', 'career_resources', 'career_projects', 'industry_deconstruction', 'industry_links', 'industry_jobs', 'job_categories', 'jobs', 'job_learning_stages', 'job_skills', 'job_resources', 'job_projects', 'job_knowledge_cards'];

async function compareDatabases() {
  console.log('正在初始化 sql.js...');
  const SQL = await initSqlJs();
  
  const results = [];
  
  for (const fileInfo of dbFiles) {
    const filePath = fileInfo.path;
    const displayName = fileInfo.name;
    
    if (!fs.existsSync(filePath)) {
      results.push({
        name: displayName,
        exists: false,
        size: 0,
        modified: 'N/A',
        tables: [],
        counts: {},
        error: '文件不存在'
      });
      continue;
    }
    
    const fileStat = fs.statSync(filePath);
    
    let db;
    try {
      const buffer = fs.readFileSync(filePath);
      db = new SQL.Database(buffer);
    } catch (e) {
      results.push({
        name: displayName,
        exists: true,
        size: fileStat.size,
        modified: fileStat.mtime.toISOString(),
        tables: [],
        counts: {},
        error: e.message
      });
      continue;
    }
    
    // 获取所有表名
    let tables = [];
    try {
      const tableResult = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
      tables = tableResult.length > 0 ? tableResult[0].values.map(v => v[0]) : [];
    } catch (e) {
      // 文件可能损坏或不是有效的SQLite数据库
      results.push({
        name: displayName,
        exists: true,
        size: fileStat.size,
        modified: fileStat.mtime.toISOString(),
        tables: [],
        counts: {},
        error: '损坏或非数据库文件'
      });
      db.close();
      continue;
    }
    
    const counts = {};
    for (const table of tables) {
      try {
        const countResult = db.exec(`SELECT COUNT(*) as count FROM "${table}"`);
        counts[table] = countResult.length > 0 ? countResult[0].values[0][0] : 0;
      } catch (e) {
        counts[table] = 'ERROR';
      }
    }
    
    results.push({
      name: displayName,
      exists: true,
      size: fileStat.size,
      modified: fileStat.mtime.toISOString(),
      tables: tables,
      counts: counts
    });
    
    db.close();
  }
  
  // 输出对比结果
  console.log('\n' + '='.repeat(120));
  console.log('数据库对比报告');
  console.log('='.repeat(120));
  
  // 1. 文件基本信息
  console.log('\n## 1. 文件基本信息\n');
  console.log('| 数据库文件 | 文件大小 | 最后修改时间 | 表数量 |');
  console.log('|-----------|---------|-------------|-------|');
  
  for (const r of results) {
    const sizeKB = (r.size / 1024).toFixed(2);
    const modTime = r.modified ? r.modified.slice(0, 19).replace('T', ' ') : 'N/A';
    console.log(`| ${r.name} | ${sizeKB} KB | ${modTime} | ${r.tables.length} |`);
  }
  
  // 2. 收集所有表名
  const allTables = new Set();
  for (const r of results) {
    for (const t of r.tables) {
      allTables.add(t);
    }
  }
  const sortedTables = Array.from(allTables).sort();
  
  // 3. 表结构对比
  console.log('\n## 2. 表结构对比（各表是否存在）\n');
  
  const maxCols = 7; // 每行最多显示的数据库数
  const dbNames = results.map(r => r.name);
  
  for (let start = 0; start < dbNames.length; start += maxCols) {
    const slice = dbNames.slice(start, start + maxCols);
    console.log('| 表名 | ' + slice.join(' | ') + ' |');
    console.log('|-----|' + slice.map(() => '---').join('|') + '|');
    
    for (const table of sortedTables) {
      const row = [table];
      for (let i = start; i < start + maxCols && i < results.length; i++) {
        const r = results[i];
        row.push(r.tables.includes(table) ? '✓' : '✗');
      }
      console.log('| ' + row.join(' | ') + ' |');
    }
    console.log('');
  }
  
  // 4. 数据量对比 - 核心表
  console.log('\n## 3. 核心表数据量对比\n');
  
  // 中文表名优先显示
  const priorityTables = ['词条', 'terms', '学科', 'disciplines', '图谱关系', 'graph_links', '概念对比', 'comparisons', '情景还原', 'scenarios', '岗位分类', 'job_categories', '岗位', 'jobs'];
  
  for (let start = 0; start < dbNames.length; start += maxCols) {
    const slice = dbNames.slice(start, start + maxCols);
    console.log('| 表名 | ' + slice.join(' | ') + ' |');
    console.log('|-----|' + slice.map(() => '---').join('|') + '|');
    
    for (const table of priorityTables) {
      if (!allTables.has(table)) continue;
      const row = [table];
      for (let i = start; i < start + maxCols && i < results.length; i++) {
        const r = results[i];
        if (r.tables.includes(table)) {
          row.push(r.counts[table] || 0);
        } else {
          row.push('-');
        }
      }
      console.log('| ' + row.join(' | ') + ' |');
    }
    console.log('');
  }
  
  // 5. 中文表名迁移情况
  console.log('\n## 4. 中文表名迁移情况\n');
  
  console.log('| 数据库 | 中文表数 | 英文表数 | 迁移状态 |');
  console.log('|-------|---------|---------|---------|');
  
  for (const r of results) {
    const chineseCount = r.tables.filter(t => chineseTables.includes(t)).length;
    const englishCount = r.tables.filter(t => englishTables.includes(t)).length;
    
    let status = '空库';
    if (chineseCount > 0 && englishCount === 0) status = '已迁移中文';
    else if (chineseCount > 0 && englishCount > 0) status = '混合(迁移中)';
    else if (englishCount > 0 && chineseCount === 0) status = '英文表';
    else status = '空库/损坏';
    
    console.log(`| ${r.name} | ${chineseCount} | ${englishCount} | ${status} |`);
  }
  
  // 6. 主库与最新备份对比
  console.log('\n## 5. 主库与最新备份对比\n');
  
  const mainDb = results[0];
  const latestBackup = results[2]; // backup_20260629
  
  if (mainDb.tables.length > 0 && latestBackup.tables.length > 0) {
    console.log('| 表名 | 主库(当前) | 最新备份 | 差异 |');
    console.log('|-----|-----------|---------|-----|');
    
    for (const table of mainDb.tables) {
      const mainCount = mainDb.counts[table];
      const backupCount = latestBackup.tables.includes(table) ? latestBackup.counts[table] : '-';
      const diff = backupCount === '-' ? '新增' : (mainCount - backupCount);
      console.log(`| ${table} | ${mainCount} | ${backupCount} | ${diff} |`);
    }
  }
  
  // 7. 数据完全一致的数据库
  console.log('\n## 6. 数据一致性分析\n');
  
  // 找出完全一致的数据库组
  const identicalGroups = [];
  const processed = new Set();
  
  for (let i = 0; i < results.length; i++) {
    if (processed.has(i) || results[i].tables.length === 0) continue;
    
    const group = [results[i].name];
    processed.add(i);
    
    for (let j = i + 1; j < results.length; j++) {
      if (processed.has(j) || results[j].tables.length === 0) continue;
      
      // 比较两个数据库
      const db1 = results[i];
      const db2 = results[j];
      
      let identical = true;
      
      // 检查表数量
      if (db1.tables.length !== db2.tables.length) {
        identical = false;
      } else {
        // 检查每个表的数据量
        for (const table of db1.tables) {
          if (!db2.tables.includes(table) || db1.counts[table] !== db2.counts[table]) {
            identical = false;
            break;
          }
        }
      }
      
      if (identical) {
        group.push(results[j].name);
        processed.add(j);
      }
    }
    
    if (group.length > 1) {
      identicalGroups.push(group);
    }
  }
  
  if (identicalGroups.length > 0) {
    console.log('以下数据库数据量完全一致：');
    for (const group of identicalGroups) {
      console.log(`  - ${group.join(', ')}`);
    }
  } else {
    console.log('所有数据库之间存在数据差异。');
  }
  
  console.log('\n' + '='.repeat(120));
  console.log('报告完成');
}

compareDatabases().catch(console.error);