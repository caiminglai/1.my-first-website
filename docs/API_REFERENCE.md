# 同物异名 · API 参考文档

> **统一入口**：`backend/server.js`
> **统一前缀**：`/api/v1`
> **统一响应格式**：`{ success: boolean, data: any, error?: { code, message } }`
> **数据源**：磁盘 SQLite `data/tongwuyiming.db`（后端启动时加载到 sql.js 内存，写入后立即持久化）
> **更新日期**：2026-06-24

---

## 目录

1. [接口总览](#1-接口总览)
2. [基础规范](#2-基础规范)
3. [词条模块](#3-词条模块)
4. [知识图谱](#4-知识图谱)
5. [概念对比](#5-概念对比)
6. [情景还原](#6-情景还原)
7. [职业解构](#7-职业解构)
8. [产业岗位](#8-产业岗位)
9. [概念抗体](#9-概念抗体)
10. [高薪技术岗](#10-高薪技术岗)
11. [用户提交](#11-用户提交)
12. [统计与健康检查](#12-统计与健康检查)
13. [管理后台 - 词条](#13-管理后台---词条)
14. [管理后台 - 学科](#14-管理后台---学科)
15. [管理后台 - 备份与仪表盘](#15-管理后台---备份与仪表盘)
16. [管理后台 - 内容模块](#16-管理后台---内容模块)
17. [前端调用约定](#17-前端调用约定)
18. [路由文件索引](#18-路由文件索引)

---

## 1. 接口总览

| 路由前缀 | 功能 | 状态 | 鉴权 |
|---------|------|------|------|
| `/api/v1/terms` | 词条查询、搜索、学科、详情、CRUD | ✅ 活跃 | 部分需要 |
| `/api/v1/graph` | 知识图谱节点与关系 | ✅ 活跃 | 公开 |
| `/api/v1/comparisons` | 概念对比 | ✅ 活跃 | 部分需要 |
| `/api/v1/scenarios` | 情景还原 | ✅ 活跃 | 公开 |
| `/api/v1/career` | 职业解构 | ✅ 活跃 | 部分需要 |
| `/api/v1/industry` | 产业岗位 | ✅ 活跃 | 部分需要 |
| `/api/v1/antibody` | 概念抗体 | ✅ 活跃 | 部分需要 |
| `/api/v1/jobs` | 高薪技术岗（分类、岗位、阶段、技能） | ✅ 活跃 | 部分需要 |
| `/api/v1/stats` | 统计 + 健康检查 + 用户反馈 | ✅ 活跃 | 公开 |
| `/api/v1/submissions` | 用户提交同物异名 | ✅ 活跃 | 部分需要 |
| `/api/v1/admin` | 管理后台（需 `x-admin-token`） | ✅ 活跃 | 需要 |
| `/api/v1/ai` | AI 问答（RAG + LLM） | ❌ 已下线 | - |

---

## 2. 基础规范

### 2.1 成功响应

```json
{
  "success": true,
  "data": { ... }
}
```

### 2.2 失败响应

```json
{
  "success": false,
  "error": { "code": "ERROR_CODE", "message": "错误描述" }
}
```

### 2.3 分页结构

列表接口统一使用以下结构：

```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "total": 120,
    "page": 1,
    "pageSize": 20
  }
}
```

词条列表使用的字段名为 `terms` 而非 `items`：

```json
{
  "success": true,
  "data": {
    "terms": [ ... ],
    "total": 225,
    "page": 1,
    "pageSize": 1000
  }
}
```

### 2.4 常见错误码

| 错误码 | HTTP状态码 | 含义 |
|--------|-----------|------|
| `NOT_FOUND` | 404 | 资源不存在 |
| `INTERNAL_ERROR` | 500 | 服务器内部错误 |
| `RATE_LIMITED` | 429 | 请求过于频繁 |
| `BLOCKED` | 403 | IP 被临时封禁 |
| `INVALID_INPUT` | 400 | 输入包含非法字符（SQL 注入检测） |
| `PAYLOAD_TOO_LARGE` | 413 | 请求体超过 1MB |
| `UNAUTHORIZED` | 401 | 管理员 Token 无效 |
| `ADMIN_NOT_CONFIGURED` | 500 | 未配置 ADMIN_TOKEN |
| `MISSING_QUERY` | 400 | 搜索缺少关键词 |
| `MISSING_FIELDS` | 400 | 缺少必填字段 |
| `MISSING_ID` | 400 | 缺少ID参数 |
| `MISSING_STATUS` | 400 | 缺少状态参数 |
| `NO_FIELDS` | 400 | 没有要更新的字段 |
| `INVALID_KEY` | 400 | 学科标识格式无效 |
| `DUPLICATE_KEY` | 400 | 学科标识已存在 |
| `INVALID_ORDER` | 400 | 排序数据格式错误 |
| `HAS_TERMS` | 400 | 学科下存在词条，无法删除 |
| `MISSING_API_KEY` | 400 | AI 问答缺少 API Key |
| `BACKUP_ERROR` | 500 | 备份失败 |
| `MIGRATE_ERROR` | 500 | 数据库迁移失败 |

### 2.5 管理接口鉴权

管理接口（`/api/v1/admin/*` 以及各模块的管理端点）必须在 HTTP Header 中携带：

```
x-admin-token: <你的 token>
```

token 值由 `backend/.env` 里的 `ADMIN_TOKEN` 环境变量定义。

---

## 3. 词条模块

### 3.1 词条列表

**接口**：`GET /api/v1/terms`

**参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `page` | number | 否 | 页码，默认 1 |
| `pageSize` | number | 否 | 每页数量，默认 50 |
| `discipline` | string | 否 | 按学科过滤（学科 id，如 `physics`） |
| `keyword` | string | 否 | 关键词（名称/翻译/本质模糊匹配） |
| `hot` | boolean | 否 | 是否只返回热门词条 |

**示例**：

```
GET /api/v1/terms?page=1&pageSize=20&discipline=physics
```

**返回**：

```json
{
  "success": true,
  "data": {
    "terms": [
      {
        "id": "physics-001",
        "discipline": "physics",
        "name": "波函数",
        "translation": "概率波",
        "essence": "...",
        "tip": "...",
        "aliases": "[]",
        "hot": 0,
        "created_at": 1718000000000
      }
    ],
    "total": 10,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### 3.2 搜索词条

**接口**：`GET /api/v1/terms/search`

**限流**：60 请求/分钟

**参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `q` | string | 是 | 搜索词 |
| `limit` | number | 否 | 返回条数，默认 8 |

**可能错误**：`MISSING_QUERY`

---

### 3.3 学科列表

**接口**：`GET /api/v1/terms/disciplines`

**说明**：返回所有学科及其词条数，前端首页学科卡片/分类导航的数据源。

**返回**：

```json
{
  "success": true,
  "data": [
    {
      "id": "math",
      "name": "数学",
      "color": "#5B7BA0",
      "description": "...",
      "display_order": 1,
      "term_count": 24
    }
  ]
}
```

---

### 3.4 单条词条详情

**接口**：`GET /api/v1/terms/:id`

**说明**：返回完整词条对象

**可能错误**：`NOT_FOUND`

---

### 3.5 热门词条

**接口**：`GET /api/v1/terms/hot`

**说明**：返回 `hot = 1` 的词条列表

---

### 3.6 最新词条

**接口**：`GET /api/v1/terms/recent`

**参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `limit` | number | 否 | 返回条数 |

---

### 3.7 随机词条

**接口**：`GET /api/v1/terms/random`

**参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `discipline` | string | 否 | 按学科随机 |

**可能错误**：`NOT_FOUND`

---

## 4. 知识图谱

### 4.1 图谱节点

**接口**：`GET /api/v1/graph/nodes`

**说明**：返回所有图谱节点

---

### 4.2 图谱关系

**接口**：`GET /api/v1/graph/links`

**说明**：返回所有节点间的关系

---

## 5. 概念对比

### 5.1 对比列表

**接口**：`GET /api/v1/comparisons`

**说明**：返回所有概念对比数据

---

### 5.2 创建对比（管理）

**接口**：`POST /api/v1/comparisons`

**鉴权**：需要 `x-admin-token`

**请求体**：

```json
{
  "id": "cmp-001",
  "title": "对比标题",
  "concept_a_name": "概念A",
  "concept_a_discipline": "cs",
  "concept_a_plain": "通俗解释A",
  "concept_a_symptom": "表现A",
  "concept_a_analogy": "类比A",
  "concept_a_fix": "解决A",
  "concept_b_name": "概念B",
  "concept_b_discipline": "econ",
  "concept_b_plain": "通俗解释B",
  "concept_b_symptom": "表现B",
  "concept_b_analogy": "类比B",
  "concept_b_fix": "解决B",
  "summary": "一句话总结",
  "relationship_type": "关联性"
}
```

---

### 5.3 更新对比（管理）

**接口**：`PUT /api/v1/comparisons/:id`

**鉴权**：需要 `x-admin-token`

**可能错误**：`MISSING_ID`

---

### 5.4 删除对比（管理）

**接口**：`DELETE /api/v1/comparisons/:id`

**鉴权**：需要 `x-admin-token`

**可能错误**：`MISSING_ID`

---

## 6. 情景还原

### 6.1 情景列表

**接口**：`GET /api/v1/scenarios`

**说明**：返回所有情景还原数据（含对话）

---

## 7. 职业解构

### 7.1 职业列表

**接口**：`GET /api/v1/career`

**参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `category` | string | 否 | 按分类过滤 |

---

### 7.2 职业分类

**接口**：`GET /api/v1/career/categories`

---

### 7.3 职业详情

**接口**：`GET /api/v1/career/:id`

**说明**：返回单个职业详情（含阶段/技能/资源/项目）

**可能错误**：`NOT_FOUND`

---

### 7.4 导出CSV（管理）

**接口**：`GET /api/v1/career/export/csv`

**鉴权**：需要 `x-admin-token`

**参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `category` | string | 否 | 按分类导出 |

---

### 7.5 导入CSV（管理）

**接口**：`POST /api/v1/career/import/csv`

**鉴权**：需要 `x-admin-token`

**请求体**：

```json
{
  "content": "CSV字符串内容"
}
```

---

### 7.6 创建职业（管理）

**接口**：`POST /api/v1/career`

**鉴权**：需要 `x-admin-token`

**可能错误**：`MISSING_FIELDS`

---

### 7.7 删除职业（管理）

**接口**：`DELETE /api/v1/career/:id`

**鉴权**：需要 `x-admin-token`

---

## 8. 产业岗位

### 8.1 产业列表

**接口**：`GET /api/v1/industry`

---

### 8.2 产业详情

**接口**：`GET /api/v1/industry/:id`

**可能错误**：`NOT_FOUND`

---

### 8.3 创建产业（管理）

**接口**：`POST /api/v1/industry`

**鉴权**：需要 `x-admin-token`

**可能错误**：`MISSING_FIELDS`

---

### 8.4 删除产业（管理）

**接口**：`DELETE /api/v1/industry/:id`

**鉴权**：需要 `x-admin-token`

---

## 9. 概念抗体

### 9.1 抗体列表

**接口**：`GET /api/v1/antibody`

**参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `term_id` | string | 否 | 按词条ID过滤 |
| `category` | string | 否 | 按分类过滤 |

---

### 9.2 抗体分类

**接口**：`GET /api/v1/antibody/categories`

---

### 9.3 导出CSV（管理）

**接口**：`GET /api/v1/antibody/export/csv`

**鉴权**：需要 `x-admin-token`

---

### 9.4 导入CSV（管理）

**接口**：`POST /api/v1/antibody/import/csv`

**鉴权**：需要 `x-admin-token`

---

### 9.5 创建抗体（管理）

**接口**：`POST /api/v1/antibody`

**鉴权**：需要 `x-admin-token`

**可能错误**：`MISSING_FIELDS`

---

### 9.6 删除抗体（管理）

**接口**：`DELETE /api/v1/antibody/:id`

**鉴权**：需要 `x-admin-token`

---

## 10. 高薪技术岗

### 10.1 岗位分类列表

**接口**：`GET /api/v1/jobs/categories`

---

### 10.2 创建分类（管理）

**接口**：`POST /api/v1/jobs/categories`

**鉴权**：需要 `x-admin-token`

**可能错误**：`MISSING_NAME`

---

### 10.3 岗位列表

**接口**：`GET /api/v1/jobs`

**参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `categoryId` | number | 否 | 按分类ID过滤 |

---

### 10.4 带详情的岗位列表

**接口**：`GET /api/v1/jobs/detailed`

**说明**：N+1优化，返回所有岗位及其 stages/skills/resources

**参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `categoryId` | number | 否 | 按分类ID过滤 |

---

### 10.5 岗位详情

**接口**：`GET /api/v1/jobs/:id`

**说明**：返回单个岗位详情（含阶段/技能/资源/项目/知识卡片）

**可能错误**：`NOT_FOUND`

---

### 10.6 创建岗位（管理）

**接口**：`POST /api/v1/jobs`

**鉴权**：需要 `x-admin-token`

**可能错误**：`MISSING_FIELDS`

---

### 10.7 更新岗位（管理）

**接口**：`PUT /api/v1/jobs/:id`

**鉴权**：需要 `x-admin-token`

---

### 10.8 删除岗位（管理）

**接口**：`DELETE /api/v1/jobs/:id`

**鉴权**：需要 `x-admin-token`

---

### 10.9 导出CSV（管理）

**接口**：`GET /api/v1/jobs/export/csv`

**鉴权**：需要 `x-admin-token`

---

### 10.10 导入CSV（管理）

**接口**：`POST /api/v1/jobs/import/csv`

**鉴权**：需要 `x-admin-token`

---

### 10.11 创建阶段（管理）

**接口**：`POST /api/v1/jobs/:id/stages`

**鉴权**：需要 `x-admin-token`

**可能错误**：`MISSING_FIELDS`

---

### 10.12 创建技能（管理）

**接口**：`POST /api/v1/jobs/:id/stages/:stageId/skills`

**鉴权**：需要 `x-admin-token`

**可能错误**：`MISSING_FIELDS`

---

## 11. 用户提交

### 11.1 待审核列表

**接口**：`GET /api/v1/submissions`

**说明**：默认返回 status=pending 的提交

---

### 11.2 已通过列表

**接口**：`GET /api/v1/submissions/approved`

---

### 11.3 提交建议

**接口**：`POST /api/v1/submissions`

**请求体（同物异名对）**：

```json
{
  "submission_type": "pair",
  "term1": "术语1",
  "term2": "术语2",
  "explanation": "解释",
  "example": "示例",
  "contact": "联系方式"
}
```

**请求体（新词条）**：

```json
{
  "submission_type": "term",
  "term_name": "词条名称",
  "term_discipline": "学科ID",
  "term_translation": "翻译",
  "term_essence": "本质",
  "term_tip": "提示",
  "term_aliases": "[]",
  "contact": "联系方式"
}
```

**可能错误**：`MISSING_FIELDS`

---

### 11.4 管理列表

**接口**：`GET /api/v1/submissions/admin`

**鉴权**：需要 `x-admin-token`

**参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `status` | string | 否 | 状态过滤：pending/approved/rejected |

---

### 11.5 更新状态（管理）

**接口**：`PUT /api/v1/submissions/admin/:id`

**鉴权**：需要 `x-admin-token`

**请求体**：

```json
{
  "status": "approved",
  "review_note": "审核备注"
}
```

**可能错误**：`MISSING_ID`, `MISSING_STATUS`

---

### 11.6 状态统计（管理）

**接口**：`GET /api/v1/submissions/admin/stats`

**鉴权**：需要 `x-admin-token`

**说明**：返回各状态的提交数量统计

---

### 11.7 审核通过（管理）

**接口**：`POST /api/v1/submissions/admin/:id/approve`

**鉴权**：需要 `x-admin-token`

**说明**：审核通过并自动创建词条

**可能错误**：`MISSING_ID`, `NOT_FOUND`, `MISSING_FIELDS`

---

### 11.8 审核拒绝（管理）

**接口**：`POST /api/v1/submissions/admin/:id/reject`

**鉴权**：需要 `x-admin-token`

**可能错误**：`MISSING_ID`

---

### 11.9 删除提交（管理）

**接口**：`DELETE /api/v1/submissions/admin/:id`

**鉴权**：需要 `x-admin-token`

**可能错误**：`MISSING_ID`

---

## 12. 统计与健康检查

### 12.1 全局统计

**接口**：`GET /api/v1/stats`

**说明**：返回全局统计数据（词条数、学科数、对比数、情景数等）

---

### 12.2 健康检查

**接口**：`GET /api/v1/stats/health`

**返回**：

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": 1718000000000,
    "uptime": 3600
  }
}
```

---

### 12.3 提交用户反馈

**接口**：`POST /api/v1/stats/feedback`

**请求体**：

```json
{
  "type": "bug",
  "content": "反馈内容",
  "term_id": "可选-相关词条ID",
  "contact": "可选-联系方式"
}
```

**type 可选值**：`bug` / `suggest` / `other`

**可能错误**：`MISSING_FIELDS`

---

## 13. 管理后台 - 词条

> 所有接口均需要 `x-admin-token`

### 13.1 词条管理列表

**接口**：`GET /api/v1/admin/terms`

**参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `page` | number | 否 | 页码，默认 1 |
| `pageSize` | number | 否 | 每页数量，默认 20 |
| `search` | string | 否 | 搜索关键词 |
| `discipline` | string | 否 | 学科过滤 |

---

### 13.2 批量创建词条

**接口**：`POST /api/v1/admin/terms`

**请求体**：词条对象数组

```json
[
  {
    "id": "term-001",
    "discipline": "cs",
    "name": "词条名",
    "translation": "翻译",
    "essence": "本质",
    "tip": "提示",
    "hot": 0
  }
]
```

---

### 13.3 更新单个词条

**接口**：`PUT /api/v1/admin/terms/:id`

**可能错误**：`NO_FIELDS`

---

### 13.4 删除单个词条

**接口**：`DELETE /api/v1/admin/terms/:id`

---

### 13.5 词条历史记录

**接口**：`GET /api/v1/admin/terms/:id/history`

**说明**：返回词条的修改历史

---

### 13.6 导出CSV

**接口**：`GET /api/v1/admin/terms/export/csv`

**参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `discipline` | string | 否 | 按学科导出 |

---

### 13.7 导入CSV

**接口**：`POST /api/v1/admin/terms/import/csv`

**请求体**：

```json
{
  "content": "CSV字符串内容"
}
```

---

## 14. 管理后台 - 学科

> 所有接口均需要 `x-admin-token`

### 14.1 学科列表

**接口**：`GET /api/v1/admin/disciplines`

---

### 14.2 创建学科

**接口**：`POST /api/v1/admin/disciplines`

**请求体**：

```json
{
  "id": "math",
  "name": "数学",
  "color": "#5B7BA0",
  "description": "学科描述",
  "display_order": 1
}
```

**可能错误**：`MISSING_FIELDS`, `INVALID_KEY`, `DUPLICATE_KEY`

---

### 14.3 更新单个学科

**接口**：`PUT /api/v1/admin/disciplines/:id`

**可能错误**：`NO_FIELDS`

---

### 14.4 批量更新排序

**接口**：`PUT /api/v1/admin/disciplines/order`

**请求体**：

```json
{
  "order": [
    { "id": "math", "order": 1 },
    { "id": "physics", "order": 2 }
  ]
}
```

**可能错误**：`INVALID_ORDER`

---

### 14.5 删除学科

**接口**：`DELETE /api/v1/admin/disciplines/:id`

**说明**：学科下有词条时返回 `HAS_TERMS` 错误

**可能错误**：`HAS_TERMS`

---

## 15. 管理后台 - 备份与仪表盘

> 所有接口均需要 `x-admin-token`

### 15.1 创建备份

**接口**：`POST /api/v1/admin/backup`

**说明**：立即创建一份数据库备份到 `data/backups/`

---

### 15.2 备份列表

**接口**：`GET /api/v1/admin/backups`

**说明**：列出所有备份文件（按时间倒序）

---

### 15.3 仪表盘统计

**接口**：`GET /api/v1/admin/dashboard`

**说明**：返回仪表盘统计数据（词条数、学科数、对比数、情景数、各学科词数分布等）

---

### 15.4 数据质量报告

**接口**：`GET /api/v1/admin/data-quality`

---

### 15.5 数据库迁移

**接口**：`POST /api/v1/admin/migrate`

**说明**：执行在线数据库迁移（不需要重启服务）

**可能错误**：`MIGRATE_ERROR`

---

## 16. 管理后台 - 内容模块

> 所有接口均需要 `x-admin-token`

同一套资源模块在 `/api/v1/admin/` 下挂载，用于 CRUD 操作：

| 接口 | 功能 |
|------|------|
| `POST /api/v1/admin/graph/links` | 新增图谱关系 |
| `DELETE /api/v1/admin/graph/links` | 删除图谱关系 |

更多内容模块的管理接口请参考各模块路由文件：

- 职业解构：[career.js](file:///e:/website/1.my-first-website/backend/routes/career.js)
- 产业岗位：[industry.js](file:///e:/website/1.my-first-website/backend/routes/industry.js)
- 概念抗体：[antibody.js](file:///e:/website/1.my-first-website/backend/routes/antibody.js)
- 高薪技术岗：[jobs.js](file:///e:/website/1.my-first-website/backend/routes/jobs.js)

---

## 17. 前端调用约定

前端 `app/src/api/client.ts` 使用 `request<T>(path, options)`：

```typescript
// 默认 30s 超时，自动重试网络错误；业务错误抛 APIErrorException。
apiClient.get<Term[]>("/api/v1/terms?page=1&pageSize=20");
apiClient.post<Discipline>("/api/v1/admin/disciplines", data);
```

请求会通过 Vite proxy 转发到 `http://localhost:3000`，生产环境直接同源请求。

---

## 18. 路由文件索引

| 文件 | 挂载路径 | 说明 |
|------|---------|------|
| [terms.js](file:///e:/website/1.my-first-website/backend/routes/terms.js) | `/api/v1/terms` | 词条查询/搜索/CRUD |
| [graph.js](file:///e:/website/1.my-first-website/backend/routes/graph.js) | `/api/v1/graph` | 知识图谱 nodes/links |
| [compare.js](file:///e:/website/1.my-first-website/backend/routes/compare.js) | `/api/v1/comparisons` | 概念对比 |
| [scenarios.js](file:///e:/website/1.my-first-website/backend/routes/scenarios.js) | `/api/v1/scenarios` | 情景还原 |
| [career.js](file:///e:/website/1.my-first-website/backend/routes/career.js) | `/api/v1/career` | 职业解构 |
| [industry.js](file:///e:/website/1.my-first-website/backend/routes/industry.js) | `/api/v1/industry` | 产业岗位 |
| [antibody.js](file:///e:/website/1.my-first-website/backend/routes/antibody.js) | `/api/v1/antibody` | 概念抗体 |
| [jobs.js](file:///e:/website/1.my-first-website/backend/routes/jobs.js) | `/api/v1/jobs` | 高薪技术岗 |
| [stats.js](file:///e:/website/1.my-first-website/backend/routes/stats.js) | `/api/v1/stats` | 统计 + 健康检查 + 用户反馈 |
| [submissions.js](file:///e:/website/1.my-first-website/backend/routes/submissions.js) | `/api/v1/submissions` | 用户提交 |
| [admin.js](file:///e:/website/1.my-first-website/backend/routes/admin.js) | `/api/v1/admin` | 词条/学科/备份/仪表盘/图谱关系 |
| [ai.js](file:///e:/website/1.my-first-website/backend/routes/ai.js) | 未挂载（DEPRECATED） | AI 问答 |

---

*更新日期：2026-06-24*
