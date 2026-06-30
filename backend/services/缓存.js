/**
 * 内存缓存模块 —— 为频繁读取但变化少的数据提供缓存
 * 当数据被写入时，调用 invalidate() 清理对应 key
 *
 * 设计：
 *   - 每个缓存项包含 value / storedAt / ttl
 *   - get() 过期时自动清理
 *   - set() 存储深拷贝（避免调用方意外修改缓存内容）
 *   - 所有 key 共享一个全局表，不引入第三方库
 */

const _ONE_MINUTE = 60 * 1000;
const _FIVE_MINUTES = 5 * _ONE_MINUTE;
const _THIRTY_SECONDS = 30 * 1000;

const _MAX_ENTRIES = 500; // 缓存最大条目数，防止内存无限增长

const _DEFAULTS = {
  terms_recent: _FIVE_MINUTES,
  terms_hot: _FIVE_MINUTES,
  disciplines: _FIVE_MINUTES,
  stats: _THIRTY_SECONDS,
  graph_nodes: _FIVE_MINUTES,
  graph_links: _FIVE_MINUTES,
  comparisons: _FIVE_MINUTES,
  scenarios: _FIVE_MINUTES,
};

const _store = new Map();

let _hits = 0;
let _misses = 0;

function _now() {
  return Date.now();
}

function _deepCopy(v) {
  if (v === undefined || v === null) return v;
  try {
    return JSON.parse(JSON.stringify(v));
  } catch {
    // 无法序列化（如循环引用、Date、Buffer 等），返回原值
    return v;
  }
}

/**
 * 读缓存
 * @param {string} key
 * @returns {*} 命中时返回值，未命中返回 null
 */
function get(key) {
  const entry = _store.get(key);
  if (!entry) {
    _misses++;
    return null;
  }
  if (entry.expiresAt < _now()) {
    _store.delete(key);
    _misses++;
    return null;
  }
  _hits++;
  return _deepCopy(entry.value);
}

/**
 * 写缓存
 * @param {string} key
 * @param {*} value
 * @param {number} [ttlMs] 默认读 key 的默认 TTL，兜底 5 分钟
 */
function set(key, value, ttlMs) {
  const ttl = ttlMs || _DEFAULTS[key] || _FIVE_MINUTES;

  // 超过最大容量时，淘汰最早的 20% 条目
  if (_store.size >= _MAX_ENTRIES && !_store.has(key)) {
    const evictCount = Math.ceil(_MAX_ENTRIES * 0.2);
    const iter = _store.keys();
    for (let i = 0; i < evictCount; i++) {
      const oldest = iter.next();
      if (oldest.done) break;
      _store.delete(oldest.value);
    }
  }

  _store.set(key, {
    value: _deepCopy(value),
    storedAt: _now(),
    expiresAt: _now() + ttl,
    ttl,
  });
}

/**
 * 清理指定 key（支持多个）
 * @param {...string} keys
 */
function invalidate(...keys) {
  for (const k of keys) {
    _store.delete(k);
  }
}

/**
 * 按前缀批量清理
 * @param {string} prefix
 */
function invalidatePrefix(prefix) {
  for (const k of _store.keys()) {
    if (k.startsWith(prefix)) {
      _store.delete(k);
    }
  }
}

/**
 * 清空全部缓存
 */
function clearAll() {
  _store.clear();
}

/**
 * 返回当前缓存状态（用于调试 / 健康检查）
 */
function getStats() {
  return {
    keys: _store.size,
    hits: _hits,
    misses: _misses,
    hitRate:
      _hits + _misses > 0 ? (_hits / (_hits + _misses)).toFixed(3) : "0.000",
  };
}

/**
 * 封装一个“尝试读缓存，否则回源并写入缓存”的高阶函数
 * @param {string} key
 * @param {() => any} fetcher 回源函数，返回值将被缓存
 * @param {number} [ttlMs]
 */
function remember(key, fetcher, ttlMs) {
  const cached = get(key);
  if (cached !== null) return cached;
  const fresh = fetcher();
  if (fresh !== undefined && fresh !== null) {
    set(key, fresh, ttlMs);
  }
  return fresh;
}

module.exports = {
  get,
  set,
  invalidate,
  invalidatePrefix,
  clearAll,
  getStats,
  remember,
};
