/**
 * 缓存 Key 常量定义
 * 统一命名规范，避免缓存冲突
 * 
 * 命名规则：
 * - 模块名_功能名 (如: terms_list)
 * - 模块名_功能名_参数 (如: terms_page_1_20)
 * - 使用下划线分隔，全部小写
 */

const CACHE_KEYS = {
  // 词条模块
  TERMS: {
    LIST: "terms_list",           // 词条列表 (带参数后缀)
    HOT: "terms_hot",             // 热门词条
    RECENT: "terms_recent",       // 最近词条
    DETAIL: "terms_detail",       // 词条详情 (带ID后缀)
    SEARCH: "terms_search",       // 搜索结果 (带query后缀)
  },
  
  // 学科模块
  DISCIPLINES: {
    LIST: "disciplines",          // 学科列表
    ADMIN: "disciplines_admin",   // 管理端学科列表
  },
  
  // 图谱模块
  GRAPH: {
    NODES: "graph_nodes",         // 图谱节点
    LINKS: "graph_links",         // 图谱关系
    DATA: "graph_data",           // 图谱完整数据
  },
  
  // 对比模块
  COMPARE: {
    LIST: "comparisons",          // 对比列表
  },
  
  // 情景模块
  SCENARIOS: {
    LIST: "scenarios",            // 情景列表
  },
  
  // 岗位模块
  JOBS: {
    CATEGORIES: "job_categories", // 岗位分类
    LIST: "jobs_list",            // 岗位列表
    DETAILED: "job_detailed",     // 岗位详情
  },
  
  // 统计模块
  STATS: {
    SUMMARY: "stats_summary",     // 统计摘要
    HEALTH: "stats_health",       // 健康检查
  },
  
  // 提交模块
  SUBMISSIONS: {
    LIST: "submissions",          // 提交列表
  },
};

/**
 * 构建带参数的缓存Key
 * @param {string} baseKey 基础Key
 * @param {any} params 参数
 * @returns {string}
 */
function buildCacheKey(baseKey, ...params) {
  if (params.length === 0) return baseKey;
  const paramStr = params
    .map(p => (p === undefined || p === null) ? "null" : String(p))
    .join("_");
  return `${baseKey}_${paramStr}`;
}

/**
 * 构建分页缓存Key
 * @param {string} baseKey 基础Key
 * @param {number} page 页码
 * @param {number} pageSize 每页数量
 * @param {string} filter 过滤条件
 * @returns {string}
 */
function buildPageKey(baseKey, page, pageSize, filter) {
  return buildCacheKey(baseKey, page, pageSize, filter || "all");
}

module.exports = {
  CACHE_KEYS,
  buildCacheKey,
  buildPageKey,
};