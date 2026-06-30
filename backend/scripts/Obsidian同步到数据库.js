#!/usr/bin/env node
/**
 * ============================================================
 *  Obsidian → 数据库 同步脚本（Obsidian 双向同步 — Obsidian→DB 方向）
 * ============================================================
 *
 *  功能说明：
 *    读取 Obsidian 仓库中的 Markdown 文件，解析后写入 SQLite 数据库
 *    支持模块：词条、概念对比
 *    支持删除传播：Obsidian 中删除的文件，对应 DB 记录也会被删除
 *
 *  工作原理：
 *    1. 扫描 Obsidian 仓库下所有 .md 文件
 *    2. 解析 frontmatter（YAML 头部信息）确定内容类型
 *    3. 按类型分发到不同的解析函数
 *    4. 判断是新建还是更新，执行相应的 SQL
 *    5. 词条的双链（[[ ]]）自动写入图谱关系表
 *    6. 删除传播：收集所有 Obsidian 中的 ID，DB 中不在列表里的记录被删除
 *
 *  使用方式：
 *    node obsidian-to-db.js [Obsidian仓库路径] [数据库路径] [选项]
 *
 *  选项：
 *    --delete-propagate    启用删除传播（DB 中不在 Obsidian 里的记录会被删除）
 *    --dry-run             只显示将要执行的操作，不实际修改数据库
 *    --modules=词条,概念对比   只处理指定模块（逗号分隔）
 *    --no-graph            不更新图谱关系
 *
 *  示例：
 *    node obsidian-to-db.js
 *    node obsidian-to-db.js ./obsidian ./data/tongwuyiming.db --delete-propagate
 *    node obsidian-to-db.js --dry-run --delete-propagate
 *    node obsidian-to-db.js --modules=词条
 * ============================================================
 */

const fs = require('fs');
const path = require('path');

// ==================== 命令行参数解析 ====================

/** 解析命令行参数 */
function parseArgs() {
  const args = process.argv.slice(2);
  const positional = [];
  const options = {
    deletePropagate: false,
    dryRun: false,
    modules: null, // null = all
    noGraph: false,
  };

  for (const arg of args) {
    if (arg === '--delete-propagate') {
      options.deletePropagate = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--no-graph') {
      options.noGraph = true;
    } else if (arg.startsWith('--modules=')) {
      options.modules = arg.slice('--modules='.length).split(',').map(s => s.trim());
    } else if (!arg.startsWith('--')) {
      positional.push(arg);
    }
  }

  return { positional, options };
}

const { positional, options: CLI_OPTIONS } = parseArgs();

/** Obsidian 仓库路径 */
const OBSIDIAN_PATH = positional[0] || path.join(__dirname, '..', '..', 'obsidian');

/** 数据库文件路径 */
const DB_PATH = positional[1] || path.join(__dirname, '..', '..', 'data', 'tongwuyiming.db');

// ==================== 配置常量 ====================

/** 忽略的文件夹 */
const 忽略目录列表 = ['.obsidian', '.git', '模板', '附件', '.trash'];

/** Obsidian 文件夹名 → 数据库类型映射 */
const 文件夹类型映射 = {
  '词条': '词条',
  '经济学': '词条',
  '医学': '词条',
  '法学': '词条',
  '计算机': '词条',
  '心理学': '词条',
  '物理学': '词条',
  '数学': '词条',
  '哲学': '词条',
  '生物学': '词条',
  '化学': '词条',
  '地理学': '词条',
  '其他学科': '词条',
  '概念对比': '概念对比',
};

/** 支持的内容类型 */
const 支持的内容类型 = new Set(['词条', '概念对比']);

// ==================== 工具函数 ====================

function 解析头部信息(文件内容) {
  const 匹配结果 = 文件内容.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!匹配结果) return { frontmatter: {}, content: 文件内容 };

  const YAML文本 = 匹配结果[1];
  const 正文内容 = 匹配结果[2].trim();
  const frontmatter = {};

  YAML文本.split('\n').forEach((行) => {
    const 冒号位置 = 行.indexOf(':');
    if (冒号位置 > 0) {
      const 键 = 行.slice(0, 冒号位置).trim();
      let 值 = 行.slice(冒号位置 + 1).trim();

      if (值.startsWith('[') && 值.endsWith(']')) {
        try {
          值 = JSON.parse(值.replace(/'/g, '"'));
        } catch {
          值 = 值.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean);
        }
      } else if (值 === 'true') {
        值 = true;
      } else if (值 === 'false') {
        值 = false;
      } else if (!isNaN(值) && 值 !== '') {
        值 = Number(值);
      }

      frontmatter[键] = 值;
    }
  });

  return { frontmatter, content: 正文内容 };
}

function 提取段落内容(内容, 标签名) {
  const 正则表达式 = new RegExp(
    `\\*\\*${标签名}[：:]\\*\\*\\s*\\n?([^*]*(?:\\n(?!\\*\\*[^*]+[：:]\\*\\*)[^*]*)*)`,
    'i'
  );
  const 匹配结果 = 内容.match(正则表达式);
  return 匹配结果 ? 匹配结果[1].trim() : '';
}

function 提取标题(内容) {
  const 匹配结果 = 内容.match(/^#\s+(.+)$/m);
  return 匹配结果 ? 匹配结果[1].trim() : '';
}

function 提取双链(内容) {
  const 双链列表 = [];
  const 正则表达式 = /\[\[([^\]]+)\]\]/g;
  let 匹配结果;
  while ((匹配结果 = 正则表达式.exec(内容)) !== null) {
    双链列表.push(匹配结果[1].trim());
  }
  return 双链列表;
}

function 扫描Markdown文件(目录, 文件列表 = []) {
  let items;
  try {
    items = fs.readdirSync(目录);
  } catch {
    return 文件列表;
  }
  for (const 项 of items) {
    const 完整路径 = path.join(目录, 项);
    const 统计信息 = fs.statSync(完整路径);
    if (统计信息.isDirectory()) {
      if (!忽略目录列表.includes(项) && !项.startsWith('.')) {
        扫描Markdown文件(完整路径, 文件列表);
      }
    } else if (项.endsWith('.md')) {
      文件列表.push(完整路径);
    }
  }
  return 文件列表;
}

function 生成唯一ID(前缀, 标题, 已有ID集合) {
  const 基础 = 标题.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '').slice(0, 6);
  let ID = `${前缀}-${基础}`;
  let 计数器 = 1;
  while (已有ID集合.has(ID)) {
    ID = `${前缀}-${基础}-${计数器}`;
    计数器++;
  }
  已有ID集合.add(ID);
  return ID;
}

function 判断内容类型(文件路径, frontmatter) {
  if (frontmatter.类型 && 支持的内容类型.has(frontmatter.类型)) {
    return frontmatter.类型;
  }
  const 相对路径 = path.relative(OBSIDIAN_PATH, 文件路径);
  const 第一层文件夹 = 相对路径.split(path.sep)[0];
  return 文件夹类型映射[第一层文件夹] || '词条';
}

// ==================== 各类型解析器 ====================

function 解析词条(frontmatter, 正文内容, 文件路径, 已有ID集合) {
  const 标题 = frontmatter.名称 || 提取标题(正文内容) || path.basename(文件路径, '.md');
  return {
    词条ID: frontmatter.词条ID || 生成唯一ID('term', 标题, 已有ID集合),
    学科: frontmatter.学科 || '未分类',
    名称: 标题,
    翻译: frontmatter.翻译 || 提取段落内容(正文内容, '人话翻译'),
    本质: frontmatter.本质 || 提取段落内容(正文内容, '本质'),
    提示: frontmatter.提示 || 提取段落内容(正文内容, '提示'),
    跨学科别名: JSON.stringify(
      Array.isArray(frontmatter.别名) ? frontmatter.别名 : []
    ),
    热度: frontmatter.热度 || 0,
    创建时间: frontmatter.创建时间 || new Date().toISOString(),
  };
}

function 解析概念对比(frontmatter, 正文内容, 文件路径, 已有ID集合) {
  const 标题 = frontmatter.标题 || 提取标题(正文内容) || path.basename(文件路径, '.md');

  const VS匹配 = 标题.match(/(.+?)\s*[VvSs][Ss]?\s*(.+)/);
  const 概念A名称 = VS匹配 ? VS匹配[1].trim() : '未知A';
  const 概念B名称 = VS匹配 ? VS匹配[2].trim() : '未知B';

  const A段落 = 正文内容.split('## 概念B：')[0];

  return {
    对比ID: frontmatter.对比ID || 生成唯一ID('cmp', 标题, 已有ID集合),
    标题: 标题,
    A概念名称: 概念A名称,
    A概念学科: frontmatter.A概念学科 || 提取段落内容(A段落, '所属学科') || '未分类',
    A概念平述: frontmatter.A概念平述 || 提取段落内容(A段落, '人话翻译'),
    A概念症状: frontmatter.A概念症状 || 提取段落内容(A段落, '表现症状'),
    A概念类比: frontmatter.A概念类比 || 提取段落内容(A段落, '生活类比'),
    A概念修正: frontmatter.A概念修正 || 提取段落内容(A段落, '解决办法'),
    B概念名称: 概念B名称,
    B概念学科: frontmatter.B概念学科 || 提取段落内容(正文内容, '所属学科') || '未分类',
    B概念平述: frontmatter.B概念平述 || 提取段落内容(正文内容, '人话翻译'),
    B概念症状: frontmatter.B概念症状 || 提取段落内容(正文内容, '表现症状'),
    B概念类比: frontmatter.B概念类比 || 提取段落内容(正文内容, '生活类比'),
    B概念修正: frontmatter.B概念修正 || 提取段落内容(正文内容, '解决办法'),
    总结: frontmatter.总结 || 提取段落内容(正文内容, '一句话区分'),
    关系类型: frontmatter.关系类型 || '关联性',
  };
}

// ==================== 删除传播 ====================

/**
 * 删除传播：找出 DB 中存在但 Obsidian 中不存在的记录，将其删除
 *
 * @param {Database} 数据库 - better-sqlite3 实例
 * @param {Set<string>} obsidian词条IDs - Obsidian 中存在的词条ID集合
 * @param {Set<string>} obsidian对比IDs - Obsidian 中存在的对比ID集合
 * @param {boolean} dryRun - 是否只预览不执行
 * @returns {object} - 删除统计
 */
function 执行删除传播(数据库, obsidian词条IDs, obsidian对比IDs, dryRun) {
  const 统计 = { 词条删除: 0, 对比删除: 0, 词条删除列表: [], 对比删除列表: [] };

  // --- 词条删除传播 ---
  const DB词条列表 = 数据库.prepare('SELECT 词条ID, 名称, 学科 FROM 词条').all();
  for (const row of DB词条列表) {
    if (!obsidian词条IDs.has(row.词条ID)) {
      统计.词条删除++;
      统计.词条删除列表.push(`${row.名称}(${row.学科})`);
      if (!dryRun) {
        // 先删图谱关系（源或目标为该词条的记录）
        数据库.prepare('DELETE FROM 图谱关系 WHERE 源节点ID = ? OR 目标节点ID = ?').run(row.词条ID, row.词条ID);
        // 再删词条本身
        数据库.prepare('DELETE FROM 词条 WHERE 词条ID = ?').run(row.词条ID);
      }
    }
  }

  // --- 概念对比删除传播 ---
  const DB对比列表 = 数据库.prepare('SELECT 对比ID, 标题 FROM 概念对比').all();
  for (const row of DB对比列表) {
    if (!obsidian对比IDs.has(row.对比ID)) {
      统计.对比删除++;
      统计.对比删除列表.push(row.标题);
      if (!dryRun) {
        数据库.prepare('DELETE FROM 概念对比 WHERE 对比ID = ?').run(row.对比ID);
      }
    }
  }

  return 统计;
}

// ==================== 图谱关系清理 ====================

/**
 * 重建图谱关系：先清除词条相关的旧关系，再根据 [[wikilinks]] 重新写入
 * 这比简单的 INSERT OR IGNORE 更准确，因为能处理链接被删除的情况
 */
function 重建图谱关系(数据库, 词条ID, 双链列表) {
  // 删除该词条作为源的所有旧关系
  数据库.prepare('DELETE FROM 图谱关系 WHERE 源节点ID = ?').run(词条ID);

  // 重新插入
  const 插入 = 数据库.prepare(
    `INSERT OR IGNORE INTO 图谱关系 (源节点ID, 目标节点ID, 关系标签) VALUES (?, ?, '关联')`
  );
  for (const 链接目标 of 双链列表) {
    const 目标 = 数据库.prepare('SELECT 词条ID FROM 词条 WHERE 名称 = ?').get(链接目标);
    if (目标) {
      插入.run(词条ID, 目标.词条ID);
    }
  }
}

// ==================== 主程序 ====================

function 主程序() {
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('  Obsidian → 数据库 同步脚本');
  console.log('  支持模块：词条、概念对比');
  if (CLI_OPTIONS.deletePropagate) console.log('  [删除传播已启用]');
  if (CLI_OPTIONS.dryRun) console.log('  [DRY RUN 模式 — 不实际修改数据库]');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  console.log(`Obsidian 仓库: ${path.resolve(OBSIDIAN_PATH)}`);
  console.log(`数据库文件:   ${path.resolve(DB_PATH)}`);
  if (CLI_OPTIONS.modules) console.log(`指定模块:     ${CLI_OPTIONS.modules.join(', ')}`);
  console.log('');

  // 检查路径
  if (!fs.existsSync(OBSIDIAN_PATH)) {
    console.error('错误: Obsidian 仓库路径不存在');
    console.error(`  路径: ${OBSIDIAN_PATH}`);
    process.exit(1);
  }
  if (!fs.existsSync(DB_PATH)) {
    console.error('错误: 数据库文件不存在');
    console.error(`  路径: ${DB_PATH}`);
    process.exit(1);
  }

  // 打开数据库 — 尝试多个可能的 better-sqlite3 路径
  const 候选路径 = [
    path.join(__dirname, '..', 'node_modules', 'better-sqlite3'),
    'better-sqlite3',
  ];
  let Database;
  for (const p of 候选路径) {
    try { Database = require(p); break; } catch { /* 尝试下一个 */ }
  }
  if (!Database) {
    console.error('错误: 找不到 better-sqlite3 模块');
    console.error('  请确保已安装依赖: cd backend && npm install');
    process.exit(1);
  }
  const 数据库 = new Database(DB_PATH);

  // 加载已有 ID
  const 已有词条ID集合 = new Set(
    数据库.prepare('SELECT 词条ID FROM 词条').all().map(r => r.词条ID)
  );
  const 已有对比ID集合 = new Set(
    数据库.prepare('SELECT 对比ID FROM 概念对比').all().map(r => r.对比ID)
  );

  // 扫描文件
  const Markdown文件列表 = 扫描Markdown文件(OBSIDIAN_PATH);
  console.log(`扫描到 ${Markdown文件列表.length} 个 Markdown 文件`);
  console.log('');

  // 统计
  const 统计 = {
    词条: { 新建: 0, 更新: 0 },
    概念对比: { 新建: 0, 更新: 0 },
    跳过: 0,
    错误: 0,
  };

  // 追踪 Obsidian 中存在的 ID（用于删除传播）
  const obsidian词条IDs = new Set();
  const obsidian对比IDs = new Set();

  // 预编译 SQL
  const SQL = {
    词条: {
      插入: 数据库.prepare(
        `INSERT INTO 词条 (词条ID, 学科, 名称, 翻译, 本质, 提示, 跨学科别名, 热度, 创建时间)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ),
      更新: 数据库.prepare(
        `UPDATE 词条 SET 学科=?, 名称=?, 翻译=?, 本质=?, 提示=?, 跨学科别名=?, 热度=?, 创建时间=?
         WHERE 词条ID=?`
      ),
      查询: 数据库.prepare('SELECT 词条ID FROM 词条 WHERE 词条ID = ?'),
    },
    概念对比: {
      插入: 数据库.prepare(
        `INSERT INTO 概念对比 (对比ID, 标题, A概念名称, A概念学科, A概念平述, A概念症状, A概念类比, A概念修正,
         B概念名称, B概念学科, B概念平述, B概念症状, B概念类比, B概念修正, 总结, 关系类型)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ),
      更新: 数据库.prepare(
        `UPDATE 概念对比 SET 标题=?, A概念名称=?, A概念学科=?, A概念平述=?, A概念症状=?, A概念类比=?, A概念修正=?,
         B概念名称=?, B概念学科=?, B概念平述=?, B概念症状=?, B概念类比=?, B概念修正=?, 总结=?, 关系类型=?
         WHERE 对比ID=?`
      ),
      查询: 数据库.prepare('SELECT 对比ID FROM 概念对比 WHERE 对比ID = ?'),
    },
  };

  // 图谱关系 SQL
  const 图谱关系插入 = 数据库.prepare(
    `INSERT OR IGNORE INTO 图谱关系 (源节点ID, 目标节点ID, 关系标签) VALUES (?, ?, '关联')`
  );

  // 收集每个词条的双链（用于后续重建图谱关系）
  const 词条双链映射 = new Map(); // termId -> [双链列表]

  // ---- 逐文件处理 ----
  for (const 文件路径 of Markdown文件列表) {
    try {
      const 文件内容 = fs.readFileSync(文件路径, 'utf-8');
      const { frontmatter, content: 正文内容 } = 解析头部信息(文件内容);
      const 内容类型 = 判断内容类型(文件路径, frontmatter);

      if (!支持的内容类型.has(内容类型)) {
        统计.跳过++;
        continue;
      }

      // 模块过滤
      if (CLI_OPTIONS.modules && !CLI_OPTIONS.modules.includes(内容类型)) {
        统计.跳过++;
        continue;
      }

      let 数据对象, ID, ID字段名, 内容名称字段;

      if (内容类型 === '词条') {
        数据对象 = 解析词条(frontmatter, 正文内容, 文件路径, 已有词条ID集合);
        ID = 数据对象.词条ID;
        ID字段名 = '词条ID';
        内容名称字段 = '名称';
        obsidian词条IDs.add(ID);
      } else if (内容类型 === '概念对比') {
        数据对象 = 解析概念对比(frontmatter, 正文内容, 文件路径, 已有对比ID集合);
        ID = 数据对象.对比ID;
        ID字段名 = '对比ID';
        内容名称字段 = '标题';
        obsidian对比IDs.add(ID);
      }

      const 已存在 = SQL[内容类型].查询.get(ID);

      if (已存在) {
        const { [ID字段名]: _, ...更新数据 } = 数据对象;
        const 更新值列表 = [...Object.values(更新数据), ID];
        if (!CLI_OPTIONS.dryRun) {
          SQL[内容类型].更新.run(...更新值列表);
        }
        统计[内容类型].更新++;
        console.log(`  [${内容类型}] 更新: ${数据对象[内容名称字段]}`);
      } else {
        const 新建值列表 = Object.values(数据对象);
        if (!CLI_OPTIONS.dryRun) {
          SQL[内容类型].插入.run(...新建值列表);
        }
        if (内容类型 === '词条') 已有词条ID集合.add(ID);
        else 已有对比ID集合.add(ID);
        统计[内容类型].新建++;
        console.log(`  [${内容类型}] 新建: ${数据对象[内容名称字段]}`);
      }

      // 收集双链（词条模块）
      if (内容类型 === '词条' && !CLI_OPTIONS.noGraph) {
        const 双链列表 = 提取双链(正文内容);
        词条双链映射.set(ID, 双链列表);
      }
    } catch (错误) {
      console.error(`  错误: ${path.basename(文件路径)} - ${错误.message}`);
      统计.错误++;
    }
  }

  // ---- 图谱关系重建 ----
  if (!CLI_OPTIONS.noGraph && 词条双链映射.size > 0) {
    console.log('');
    console.log(`重建图谱关系（${词条双链映射.size} 个词条）...`);
    if (!CLI_OPTIONS.dryRun) {
      for (const [termId, 双链列表] of 词条双链映射) {
        重建图谱关系(数据库, termId, 双链列表);
      }
    }
  }

  // ---- 删除传播 ----
  let 删除统计 = null;
  if (CLI_OPTIONS.deletePropagate) {
    console.log('');
    console.log('--- 删除传播 ---');
    console.log(`Obsidian 中词条 ID 数: ${obsidian词条IDs.size}`);
    console.log(`Obsidian 中对比 ID 数: ${obsidian对比IDs.size}`);

    删除统计 = 执行删除传播(数据库, obsidian词条IDs, obsidian对比IDs, CLI_OPTIONS.dryRun);

    if (删除统计.词条删除 > 0) {
      console.log(`将从 DB 删除 ${删除统计.词条删除} 个词条:`);
      删除统计.词条删除列表.forEach(name => console.log(`  - ${name}`));
    }
    if (删除统计.对比删除 > 0) {
      console.log(`将从 DB 删除 ${删除统计.对比删除} 个对比:`);
      删除统计.对比删除列表.forEach(name => console.log(`  - ${name}`));
    }
    if (删除统计.词条删除 === 0 && 删除统计.对比删除 === 0) {
      console.log('没有需要删除的记录');
    }
    if (CLI_OPTIONS.dryRun) {
      console.log('[DRY RUN] 以上删除未实际执行');
    }
  }

  // ---- 输出统计 ----
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  同步完成 ${CLI_OPTIONS.dryRun ? '(DRY RUN)' : ''}`);
  console.log('═══════════════════════════════════════════════════');

  for (const [类型, 计数] of Object.entries(统计)) {
    if (类型 === '跳过' || 类型 === '错误') continue;
    const 总数 = 计数.新建 + 计数.更新;
    if (总数 > 0) {
      console.log(`  ${类型}: 新建 ${计数.新建} | 更新 ${计数.更新}`);
    }
  }
  if (删除统计) {
    console.log(`  删除传播: 词条 -${删除统计.词条删除} | 对比 -${删除统计.对比删除}`);
  }
  console.log(`  跳过: ${统计.跳过} 个`);
  console.log(`  错误: ${统计.错误} 个`);
  console.log('');

  // 数据库统计
  const DB统计 = {
    词条: 数据库.prepare('SELECT COUNT(*) as n FROM 词条').get().n,
    概念对比: 数据库.prepare('SELECT COUNT(*) as n FROM 概念对比').get().n,
    图谱关系: 数据库.prepare('SELECT COUNT(*) as n FROM 图谱关系').get().n,
  };
  console.log('数据库当前统计:');
  console.log(`  词条: ${DB统计.词条}`);
  console.log(`  概念对比: ${DB统计.概念对比}`);
  console.log(`  图谱关系: ${DB统计.图谱关系}`);
  console.log('');

  数据库.close();
}

主程序();
