# 代码审计报告

**审计时间**: 2026-06-23
**审计范围**: backend/db, backend/services, backend/routes, backend/middleware
**审计维度**: SQL安全、错误处理、参数校验、缓存逻辑、事务处理、API一致性、安全配置

---

## 一、严重问题（必须修复）

### 1.1 事务原子性问题
**文件**: `backend/db/admin.js`
**位置**: `updateDisciplineOrder` 函数 (L140-148)
**问题**: 批量更新操作使用多次独立 `prepare().run()` 调用，无事务保护
```javascript
// 问题代码
order.forEach((id, index) => {
  prepare("UPDATE 学科 SET 显示顺序 = ? WHERE 学科ID = ?").run(index + 1, id);
});
```
**影响**: 部分更新失败时数据不一致
**修复建议**: 使用事务包裹
```javascript
exec("BEGIN TRANSACTION");
try {
  // 执行所有更新
  exec("COMMIT");
} catch {
  exec("ROLLBACK");
  throw e;
}
```

---

### 1.2 错误被吞掉
**文件**: `backend/db/admin.js`
**位置**: `batchCreateTerms` 函数 (L70-74)
**问题**: 插入失败只记录日志，错误未向上抛出
```javascript
} catch (err) {
  console.log("[DEBUG] Insert error:", err, ...);
  failed++;
  errors.push({ id: item.id, error: err.message });
}
```
**影响**: 调用方无法感知失败，可能导致数据不一致
**修复建议**: 在最后统一处理失败情况，或抛出聚合错误

---

### 1.3 CORS 通配符配置
**文件**: `backend/server.js`
**位置**: 第15-25行
**问题**: 使用通配符 `origin: '*'`
```javascript
app.use(cors({
  origin: '*',
  // ...
}));
```
**影响**: 任何网站都可访问API，存在安全风险
**修复建议**: 明确指定允许的域名列表
```javascript
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```

---

## 二、高优先级问题

### 2.1 参数校验缺失
**多个服务文件**: `terms.service.js`, `submissions.service.js`, `jobs.service.js`

**问题示例** (`terms.service.js`):
```javascript
function getTerms(page, pageSize, discipline) {
  // page, pageSize 未校验是否为正整数
  // discipline 未校验类型
}
```

**影响**: 非法参数可能导致SQL错误或异常
**修复建议**:
```javascript
function getTerms(page, pageSize, discipline) {
  page = Math.max(1, parseInt(page, 10) || 1);
  pageSize = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 20));
  if (discipline && typeof discipline !== 'string') {
    throw new Error('INVALID_DISCIPLINE');
  }
  // ...
}
```

---

### 2.2 缓存同步不及时
**文件**: `backend/services/jobs.service.js`
**位置**: `createJob`, `updateJob`, `deleteJob` 函数
**问题**: 修改数据后缓存未及时失效

```javascript
// 问题: markDirty() 后未调用 cache.invalidate
function createJob(data) {
  // ...
  markDirty();
  // 缺少: cache.invalidate('jobs', 'job_categories');
  return { id: result.lastInsertRowid };
}
```

**影响**: 前端可能读到过期数据
**修复建议**: 参照 `approveSubmission` 函数
```javascript
markDirty();
cache.invalidate('jobs', 'job_categories', 'job_detailed');
```

---

### 2.3 缺少输入验证中间件
**文件**: `backend/routes/` 多个文件
**问题**: `req.body` 和 `req.query` 直接传给服务层
```javascript
// submissions.js
router.post("/", (req, res) => {
  const result = submissionsService.createSubmission(req.body || {});
  // 未验证必填字段
});
```
**影响**: 恶意输入可能导致数据库错误
**修复建议**: 添加验证中间件或函数
```javascript
function validateSubmission(req, res, next) {
  const { submission_type } = req.body;
  if (submission_type === 'pair' && (!req.body.term1 || !req.body.term2)) {
    return res.status(400).json({ success: false, error: 'MISSING_FIELDS' });
  }
  next();
}
```

---

### 2.4 响应格式不一致
**文件**: `backend/routes/` 多个文件
**问题**: 有的返回 `{ success, data }`，有的直接返回数据数组

```javascript
// terms.js
res.json({ success: true, data: terms });

// comparisons.js
res.json(comparisons); // 缺少 success 包装
```

**影响**: 前端需要区分处理，增加复杂度
**修复建议**: 统一响应格式
```javascript
function successResponse(res, data) {
  res.json({ success: true, data });
}
```

---

## 三、中优先级问题

### 3.1 SQL 别名使用不统一
**文件**: 多个 service 文件

**问题**: 部分查询使用中文字段名，部分使用英文别名
```javascript
// antibody.service.js - 使用中文
const rows = prepare(`SELECT * FROM 概念抗体`).all();

// jobs.service.js - 使用别名
const jobs = prepare(`SELECT 岗位ID as id, ...`).all();
```

**影响**: 代码维护困难，容易混淆
**修复建议**: 统一使用 SQL 别名，中文字段名仅在数据库层面存在

---

### 3.2 日志记录不完整
**文件**: `backend/middleware/logger.js`
**问题**: 缺少关键信息
```javascript
// 缺少: 请求ID、用户IP、响应时间
console.log(req.path);
```
**修复建议**:
```javascript
console.log({
  timestamp: new Date().toISOString(),
  method: req.method,
  path: req.path,
  ip: req.ip,
  userAgent: req.get('user-agent'),
  duration: Date.now() - startTime
});
```

---

### 3.3 缺少请求体大小限制
**文件**: `backend/server.js`
**问题**: 未设置 `body-parser` 大小限制
```javascript
app.use(express.json());
// 建议添加
app.use(express.json({ limit: '1mb' }));
```
**影响**: 可能被大请求耗尽内存

---

### 3.4 错误处理中间件不完善
**文件**: `backend/server.js`
**问题**: 错误信息可能泄露敏感信息
```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
  // 建议: 不在生产环境返回栈信息
});
```

---

### 3.5 缓存 Key 命名不统一
**文件**: `backend/services/cache.js`
**问题**: 不同服务使用不同的缓存前缀
```javascript
// terms.service.js
cache.remember('terms_page_' + page + '_' + pageSize + '_' + discipline, ...)

// jobs.service.js
cache.remember('jobs_detailed', ...)
```
**影响**: 缓存管理困难，容易冲突
**修复建议**: 使用统一的命名规范
```javascript
const CACHE_KEYS = {
  TERMS: 'terms',
  JOBS: 'jobs',
  DISCIPLINES: 'disciplines'
};
```

---

## 四、低优先级问题

### 4.1 代码重复
**文件**: `backend/routes/submissions.js`
**位置**: GET `"/"` 和 GET `"/approved"` 重复逻辑
```javascript
// 两个路由几乎完全相同
router.get("/", (req, res) => {
  const list = submissionsService.getSubmissions("pending");
  // ...
});

router.get("/approved", (req, res) => {
  const list = submissionsService.getSubmissions("approved");
  // ...
});
```
**修复建议**: 合并为一个路由，通过查询参数区分

---

### 4.2 魔法数字
**文件**: 多个服务文件
**问题**: 硬编码数字缺乏说明
```javascript
const terms = prepare(`SELECT ... LIMIT ? OFFSET ?`).all(20, 0);
//                          ^^^^^  ^^^^^ 魔法数字
```
**修复建议**: 使用命名常量
```javascript
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_PAGE = 1;
```

---

### 4.3 缺少 API 版本控制
**问题**: API 路径使用 `/api/v1/`，但无版本切换机制
**修复建议**: 添加 `/api/v2/` 目录，渐进式迁移

---

## 五、安全检查结果

### 5.1 SQL 注入防护 ✅
**结果**: 所有 SQL 查询均使用参数化查询，安全

### 5.2 认证/授权 ⚠️
**结果**: 管理接口有 token 验证，公开接口无认证
**建议**: 公开接口添加速率限制防止滥用

### 5.3 XSS 防护 ✅
**结果**: API 返回 JSON，前端需自行处理转义

### 5.4 依赖安全
**建议**: 运行 `npm audit` 检查已知漏洞

---

## 六、修复优先级建议

| 优先级 | 问题 | 影响 | 修复工作量 |
|--------|------|------|-----------|
| P0 | 事务原子性 | 数据一致性 | 2小时 |
| P0 | CORS 配置 | 安全风险 | 30分钟 |
| P1 | 参数校验 | 稳定性 | 4小时 |
| P1 | 缓存同步 | 数据时效性 | 2小时 |
| P1 | 响应格式不一致 | 前端适配困难 | 2小时 |
| P2 | 输入验证 | 安全/稳定性 | 3小时 |
| P2 | 错误处理完善 | 可调试性 | 2小时 |
| P3 | 代码重复/规范 | 可维护性 | 持续改进 |

---

## 七、总结

### 做得好的方面
- SQL 注入防护到位，全部使用参数化查询
- 中文字段名使用 SQL 别名转换，设计合理
- 有缓存机制提高性能
- 管理接口有认证保护

### 需要改进的方面
- 事务处理不完整，批量操作缺乏原子性
- 输入校验不足，可能导致异常
- 错误处理不够完善
- CORS 配置过于宽松

### 建议行动
1. **立即修复**: CORS 配置、事务处理
2. **本周修复**: 参数校验、缓存同步
3. **持续改进**: 响应格式统一、日志完善
