# 同物异名 · Code Wiki 开发文档

> **定位**：跨学科概念还原库 —— 各学科、行业中"同一个本质换不同名字"的对照与通俗解释。
> **风格**：科学不装。
> **更新日期**：2026-06-24

---

## 目录

### 第一部分：快速开始
1. [快速访问](#一快速访问)
2. [技术栈速览](#二技术栈速览)
3. [本地启动流程](#三本地启动流程)
4. [数据操作与维护](#四数据操作与维护)
5. [服务器部署指南](#五服务器部署指南)
6. [运维清单与安全要点](#六运维清单与安全要点)
7. [故障排查速查表](#七故障排查速查表)
8. [常用命令](#八常用命令)

### 第二部分：开发文档
9. [项目概述](#九项目概述)
10. [架构设计](#十架构设计)
11. [前端模块详解](#十一前端模块详解)
12. [后端模块详解](#十二后端模块详解)
13. [数据库设计](#十三数据库设计)
14. [API 接口](#十四api-接口)
15. [依赖关系](#十五依赖关系)
16. [运行与部署](#十六运行与部署)
17. [安全要点](#十七安全要点)
18. [故障排查](#十八故障排查)

---

---

## 第一部分：快速开始

---

## 一、快速访问

| 环境 | 地址 |
|------|------|
| 本地前端 | http://localhost:3001/twym/ |
| 本地后端 API | http://localhost:3000/api/v1 |
| 管理后台（HTML） | http://localhost:3000/admin |
| 服务器 | http://your_server_ip/twym/ |

**⚠️ 路径末尾必须带斜杠**：`/twym/` ✅，`/twym` ❌

---

## 二、技术栈速览

| 层 | 技术 |
|----|------|
| 前端框架 | React 19 + TypeScript + Vite 5 |
| 前端样式 | Tailwind CSS 3 + 自定义设计系统 |
| 前端动画 | Framer Motion |
| 前端图标 | Lucide React |
| 后端 | Node.js 20+ + Express.js 4 |
| 数据库 | SQLite（通过 sql.js 内存操作 + 持久化到磁盘文件） |
| 管理后台 | 单文件 HTML + 原生 JS + CSS（`backend/public/admin.html`） |
| 构建部署 | Vite 构建前端 → `app/dist/`，后端以 PM2 守护 |
| API 规范 | RESTful，统一响应格式 `{ success, data, error }` |
| 数据源唯一 | `backend/data/tongwuyiming.db`（磁盘 SQLite 文件） |

---

## 三、本地启动流程

### 3.1 启动后端

```bash
cd backend
npm install   # 首次运行或依赖变更后执行
npm start      # 服务监听 3000 端口
```

启动后终端应出现：
- `[DB] 已从磁盘加载: .../data/tongwuyiming.db`
- API 地址：`http://localhost:3000/api/v1`
- 健康检查：`http://localhost:3000/api/v1/stats/health`

### 3.2 启动前端

```bash
cd app
npm install    # 首次运行
npm run dev    # Vite 开发服务器，默认端口 3001
```

浏览器打开 `http://localhost:3001/twym/`。

### 3.3 访问管理后台

打开 `http://localhost:3000/admin`，用 `x-admin-token` 登录（token 定义在 `backend/.env` 的 `ADMIN_TOKEN`）。

---

## 四、数据操作与维护

### 4.1 DB 文件是唯一真相源

- **位置**：`backend/data/tongwuyiming.db`
- **格式**：标准 SQLite 数据库文件，可用 `DB Browser for SQLite`、`sqlite3` CLI 等工具直接打开查看与编辑
- **不可替代**：不要手动编辑 `data/*.json`（这些文件现在只是备份产物）

### 4.2 新建数据库

如果数据库文件缺失，后端会自动从 `db/schema.sql` 建表并生成一个空数据库。若需从零开始：

```bash
cd backend
rm data/tongwuyiming.db
node db/init.js   # 只建表，不导入任何数据
# 然后用管理后台手动录入词条
```

### 4.3 备份

- **自动**：管理后台 `POST /api/v1/admin/backup` 生成 `data/backups/backup_YYYY-MM-DD_HH-MM-SS.db`
- **手动**：直接复制 `data/tongwuyiming.db` 文件到安全位置即可
- **列表**：`GET /api/v1/admin/backups`

### 4.4 迁移到新学科 / 新增字段

如果要给 `词条` 表新增字段（如 `跨学科别名`）：
1. 在 `backend/db/schema.sql` 中更新 CREATE TABLE 语句（方便全新初始化）
2. 在 `backend/db/index.js` 的 `runMigrations()` 中加一条 `ALTER TABLE 词条 ADD COLUMN 跨学科别名 TEXT DEFAULT '[]'`
3. 重启后端，迁移会自动执行（`sqlite3` 的 `ALTER TABLE ADD COLUMN` 是幂等的）

---

## 五、服务器部署指南

### 5.1 服务器信息（阿里云）

| 配置项 | 值 |
|--------|-----|
| 公网 IP | your_server_ip |
| 系统 | Alibaba Cloud Linux 3 |
| 规格 | 2vCPU / 2GiB / 40GB ESSD |
| SSH | `root@your_server_ip:22` |
| 部署路径 | `/var/www/my-first-website/` |
| PM2 进程名 | `my-website` |

### 5.2 生产部署步骤

1. **本地构建前端**
   ```bash
   cd app
   npm run build
   # 产物在 app/dist/
   ```

2. **上传文件到服务器**
   ```
   /var/www/my-first-website/
   ├── backend/           # 上传整个 backend 目录，排除 node_modules 后 npm install
   │   ├── server.js
   │   ├── .env
   │   └── data/tongwuyiming.db   # 最重要的数据源
   └── dist/              # 前端构建产物
   ```

3. **配置环境变量** `backend/.env`
   ```
   NODE_ENV=production
   PORT=3000
   ADMIN_TOKEN=your_secure_token
   FRONTEND_URL=http://your_server_ip
   ```

4. **启动后端（PM2 守护）**
   ```bash
   cd /var/www/my-first-website/backend
   npm install
   pm2 start server.js --name my-website
   pm2 save
   pm2 startup systemd
   ```

5. **Nginx 反代**（简化示例）
   ```nginx
   server {
       listen 80;
       server_name your_server_ip;

       # 前端 SPA
       location /twym/ {
           root /var/www/my-first-website/dist/;
           try_files $uri /twym/index.html;
       }

       # 后端 API
       location /api/ {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }

       # 管理后台
       location /admin {
           proxy_pass http://127.0.0.1:3000;
       }
   }
   ```

### 5.3 数据更新部署流程

```bash
# 1. 先备份数据库
cp backend/data/tongwuyiming.db backend/data/backups/tongwuyiming_backup_$(date +%Y%m%d_%H%M%S).db

# 2. 上传新的 DB 文件（如果是从本地迁移来的）
# 或直接在管理后台改内容，系统会自动持久化

# 3. 重启后端让新 DB 生效
pm2 restart my-website
```

---

## 六、运维清单与安全要点

### 6.1 每日巡检

| 检查 | 方法 |
|------|------|
| 后端进程 | `pm2 list` 看 `my-website` status |
| 端口监听 | `netstat -tlnp | grep 3000` |
| 最近日志 | `pm2 logs my-website --lines 50` |
| 磁盘使用 | `df -h`（`/var` 分区） |

### 6.2 数据安全

- `tongwuyiming.db` 是你的核心资产，**每次部署前手动备份一次**
- `.env` 中 `ADMIN_TOKEN` 不要提交到 Git（已在 `.gitignore` 中），生产环境请改成强随机字符串
- `data/backups/` 目录定期保留近 7 天的备份，过期可删除
- 用户提交（`用户提交` / `用户反馈` 表）包含用户可能输入的任意文本，**在管理后台渲染时已经转义**，不会触发 XSS，但导出数据时仍建议 CSV

### 6.3 限流与防刷

| 规则 | 限制 |
|------|------|
| 全局公开接口 | 1000 请求/分钟/IP |
| 搜索接口 | 叠加 600 请求/分钟 |
| 管理接口 | 叠加 300 请求/分钟 |

### 6.4 重启后端

```bash
pm2 restart my-website
pm2 logs my-website --lines 30   # 确认启动日志
```

---

## 七、故障排查速查表

| 症状 | 可能原因 | 解决方法 |
|------|----------|---------|
| 前端页面"词条数显示为 0"，学科卡片全空 | 磁盘 DB 文件为空 / 路径错了 | 检查 `backend/data/tongwuyiming.db` 是否存在、大小是否正常；用 `sqlite3` 打开查 `SELECT COUNT(*) FROM 词条` |
| 前端首页数据过期、与管理后台不一致 | 前端 hooks 模块级缓存未失效 | 刷新浏览器强制重加载；或更新前端缓存逻辑加 `?ts=timestamp` 绕过缓存 |
| 管理后台无法登录 | `ADMIN_TOKEN` 未设置 / 前端存储的 token 为空 | 检查 `backend/.env`；登录页面重新输入 |
| 修改词条后数据没保存 | 后端没捕获 `markDirty()`，或磁盘无写权限 | 检查 `data/` 目录权限；确认日志中有 `[DB Save]` 相关输出 |
| 服务正常但浏览器看不到页面 | Nginx 配置错误，或前端 `basename=/twym/` 不一致 | 检查 Nginx 的 location 配置 |
| 502 Bad Gateway | 后端进程挂了 / 端口没监听 | `pm2 restart my-website`；查 `pm2 logs` 的崩溃栈 |
| 概念抗体/职业解构无数据 | 表中暂无数据 | 通过管理后台添加数据 |
| 中文表名查询报错 | SQL别名未正确设置 | 检查服务层 SQL 语句 |

---

## 八、常用命令

### 8.1 后端

```bash
npm start              # 启动
npm run dev            # 开发模式（watch）
node db/init.js        # 初始化空数据库（仅首次）
```

### 8.2 前端

```bash
npm run dev            # Vite 开发服务器
npm run build          # 生产构建
npm run typecheck      # TypeScript 类型检查
npm run lint           # ESLint
```

### 8.3 PM2

```bash
pm2 list
pm2 logs my-website --lines 50
pm2 restart my-website
pm2 stop my-website
pm2 delete my-website
pm2 save
pm2 startup
```

### 8.4 直接操作数据库

```bash
# 安装 sqlite3 CLI
apt-get install -y sqlite3

# 查询
sqlite3 /var/www/my-first-website/backend/data/tongwuyiming.db
> SELECT COUNT(*) FROM 词条;
> SELECT 词条ID, 名称, 学科 FROM 词条 LIMIT 10;
> SELECT 学科ID, 学科名称, term_count FROM 学科 ORDER BY 显示顺序;
> .quit
```

---

---

## 第二部分：开发文档

---

## 九、项目概述

### 9.1 项目定位与目标

本项目是一个**跨学科概念知识平台**，旨在帮助用户理解不同学科领域中看似不同但本质相同的概念。核心价值：

- **术语翻译**：将专业术语转化为通俗易懂的语言
- **概念对比**：揭示相似概念的本质差异
- **知识图谱**：展示概念之间的关联关系
- **情景还原**：通过真实场景理解术语的实际应用
- **职业解构**：拆解高薪技术岗位的学习路径
- **概念抗体**：识别和抵御常见的概念误解

### 9.2 技术栈

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 前端框架 | React | 19 | 主框架 |
| 前端语言 | TypeScript | ~5.9.3 | 类型安全 |
| 构建工具 | Vite | 7 | 快速开发与构建 |
| 样式方案 | Tailwind CSS | 3 | 原子化CSS |
| UI组件库 | Radix UI | 1 | 可访问性组件 |
| 图标库 | Lucide React | 0.562 | 图标组件 |
| 动画库 | Framer Motion | 12 | 流畅动画 |
| 图表库 | Recharts | 2 | 数据可视化 |
| 后端框架 | Express.js | 4 | REST API |
| 数据库 | SQLite | sql.js | 内存数据库 + 持久化 |
| AI集成 | OpenAI API | 4 | 智能问答（已下线） |

---

## 十、架构设计

### 10.1 整体架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           前端层 (React)                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │   Pages     │  │  Components │  │   Hooks     │  │    API      │   │
│  │ (页面路由)   │  │  (UI组件)   │  │ (状态管理)  │  │ (接口调用)  │   │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘   │
│         │                │                │                 │          │
└─────────┼────────────────┼────────────────┼─────────────────┼──────────┘
          │                │                │                 │
          ▼                ▼                ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           后端层 (Express)                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │   Routes    │  │  Services   │  │    DB       │  │  Middleware │   │
│  │ (路由控制)   │  │  (业务逻辑)  │  │ (数据访问)  │  │ (安全/限流) │   │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘   │
│         │                │                │                 │          │
└─────────┼────────────────┼────────────────┼─────────────────┼──────────┘
          │                │                │                 │
          ▼                ▼                ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        数据层 (SQLite)                                │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  词条 | 学科 | 图谱关系 | 概念对比 | 情景 | 用户提交 | 用户反馈   │  │
│  │  职业解构 | 产业拆解 | 概念抗体 | 岗位 | 岗位分类 | 知识卡片     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 10.2 数据流

```
前端浏览器 (http://localhost:3001/twym/)
         │
         ▼  React Router 路由分发
         │
  ┌───── apiClient (fetch + AbortController + 重试) ──────┐
  │  ▼ 前端 hooks 层：useTerms / useDisciplines 做模块级缓存 │
  │  ▼ Vite dev proxy 转发 /api → http://localhost:3000    │
  └──────────────────────────────────────────────────────────┘
         │
         ▼
  后端 Express (http://localhost:3000)
         │
  ┌─ routes/ ── services/ ── db/index.js（sql.js 内存操作）──┐
  │  ▼ 每次写入 → markDirty() → db.export() → fs.writeFileSync │
  └──────────────────────────────────────────────────────────┘
         │
         ▼
  磁盘文件：data/tongwuyiming.db（唯一数据源）
```

---

## 十一、前端模块详解

### 11.1 目录结构

```
app/src/
├── api/              # API 接口层
│   ├── client.ts     # HTTP 请求封装
│   ├── config.ts     # API 配置（端点、超时、重试）
│   ├── services.ts   # 业务服务函数
│   ├── types.ts      # 类型定义
│   └── index.ts      # 统一导出
├── components/       # UI 组件
│   ├── ui/           # Radix UI 封装组件
│   ├── AIAssistant.tsx
│   ├── ConceptGraph.tsx
│   ├── ConceptCompareTool.tsx
│   ├── TermCard.tsx
│   └── ...
├── hooks/            # 自定义 Hooks
│   ├── useTerms.ts       # 词条数据管理
│   ├── useDisciplines.ts # 学科数据管理
│   ├── useFavorites.ts   # 收藏功能
│   ├── useTheme.ts       # 主题切换
│   └── useMobile.ts      # 移动端检测
├── pages/            # 页面组件
│   ├── Home.tsx
│   ├── DisciplinePage.tsx
│   ├── ConceptAntibody.tsx
│   ├── CareerDeconstruction.tsx
│   ├── TechDeconstruction.tsx
│   └── ...
├── sections/         # 页面区块
│   ├── Navbar.tsx
│   ├── HeroSection.tsx
│   ├── SearchSection.tsx
│   └── Footer.tsx
├── types/            # 全局类型
├── lib/              # 工具函数
├── App.tsx           # 根组件
├── main.tsx          # 入口文件
└── index.css         # 全局样式
```

### 11.2 核心模块说明

#### 11.2.1 API 模块 (`app/src/api/`)

**api/client.ts** - HTTP 请求封装

| 函数/类 | 说明 | 关键特性 |
|---------|------|----------|
| `APIErrorException` | 自定义错误类 | 包含 code、status、message |
| `request<T>()` | 核心请求函数 | 超时控制、自动重试、错误处理 |
| `apiClient` | 请求方法封装 | get/post/put/del |

**api/services.ts** - 业务服务函数

| 函数 | 说明 | API 端点 |
|------|------|----------|
| `getTerms()` | 获取词条列表 | `GET /api/v1/terms` |
| `getTermById()` | 获取单个词条 | `GET /api/v1/terms/:id` |
| `searchTerms()` | 搜索词条 | `GET /api/v1/terms/search` |
| `getDisciplines()` | 获取学科列表 | `GET /api/v1/terms/disciplines` |
| `getGraphData()` | 获取图谱数据 | `GET /api/v1/graph/nodes/links` |
| `getComparisons()` | 获取概念对比 | `GET /api/v1/comparisons` |
| `getScenarios()` | 获取情景还原 | `GET /api/v1/scenarios` |
| `getCareers()` | 获取职业解构 | `GET /api/v1/career` |
| `getJobs()` | 获取高薪岗位 | `GET /api/v1/jobs` |
| `getAntibodies()` | 获取概念抗体 | `GET /api/v1/antibody` |
| `createSubmission()` | 创建用户提交 | `POST /api/v1/submissions` |
| `submitFeedback()` | 提交反馈 | `POST /api/v1/stats/feedback` |

**api/config.ts** - API 配置

```typescript
// 关键配置
export const API_BASE_URL = ''  // 开发环境使用相对路径
export const REQUEST_TIMEOUT = 30000  // 30秒超时
export const RETRY_CONFIG = { maxRetries: 3, retryDelay: 1000 }
```

#### 11.2.2 Hooks 模块 (`app/src/hooks/`)

**useTerms.ts** - 词条数据管理

| 特性 | 说明 |
|------|------|
| 模块级缓存 | 所有组件共享同一份数据 |
| TTL 缓存 | 2分钟自动刷新 |
| 并发控制 | 使用 `_inflight` 避免重复请求 |
| 订阅机制 | 使用 `useSyncExternalStore` 实现响应式 |

**useDisciplines.ts** - 学科数据管理

| 特性 | 说明 |
|------|------|
| 模块级缓存 | 5分钟 TTL |
| 颜色映射 | `useDisciplineColor()` 获取学科颜色 |
| 名称映射 | `useDisciplineName()` 获取学科名称 |

**useFavorites.ts** - 收藏功能

| 函数 | 说明 |
|------|------|
| `isFavorite(id)` | 检查是否已收藏 |
| `toggleFavorite(item)` | 切换收藏状态 |
| `removeFavorite(id)` | 移除收藏 |
| `clearFavorites()` | 清空所有收藏 |
| 存储 | localStorage 持久化 |

#### 11.2.3 页面组件 (`app/src/pages/`)

| 页面 | 路由 | 说明 |
|------|------|------|
| `Home` | `/` | 首页 - 学科入口、图谱、对比器 |
| `DisciplinePage` | `/discipline/:id` | 学科详情页 |
| `ConceptAntibody` | `/antibody` | 概念抗体页面 |
| `CareerDeconstruction` | `/deconstruction` | 职业解构页面 |
| `TechDeconstruction` | `/tech` | 岗位拆解页面 |
| `TermTimeline` | `/timeline` | 词条时间线 |
| `UserSubmission` | `/submit` | 用户提交页面 |

#### 11.2.4 核心 UI 组件

**TermCard.tsx** - 词条卡片

| 功能 | 说明 |
|------|------|
| 数据适配 | 支持 `TermEntry` 和 `APITerm` 两种格式 |
| 收藏交互 | 点击星标添加/移除收藏 |
| 分享功能 | 一键分享词条 |
| 动画效果 | Framer Motion 入场动画 |

**ConceptGraph.tsx** - 概念图谱

| 功能 | 说明 |
|------|------|
| D3.js 力导向图 | 节点拖拽、自动布局 |
| 学科颜色编码 | 不同学科用不同颜色 |
| 节点大小 | 热门词条显示更大 |
| 点击交互 | 跳转到对应学科页 |

**ConceptCompareTool.tsx** - 概念对比器

| 功能 | 说明 |
|------|------|
| 双概念对比 | 左右布局展示差异 |
| 维度对比 | 人话翻译、症状、类比、解决办法 |
| AI 辅助生成 | 一键生成对比内容 |

---

## 十二、后端模块详解

### 12.1 目录结构

```
backend/
├── db/               # 数据库层
│   ├── index.js      # 数据库入口（初始化、读写）
│   ├── schema.sql    # 数据库表结构定义
│   ├── terms.js      # 词条数据访问
│   ├── graph.js      # 图谱关系数据访问
│   ├── admin.js      # 管理数据访问
│   └── init.js       # 数据库初始化脚本
├── routes/           # 路由层
│   ├── terms.js      # 词条路由
│   ├── graph.js      # 图谱路由
│   ├── compare.js    # 对比路由
│   ├── scenarios.js  # 情景路由
│   ├── career.js     # 职业解构路由
│   ├── industry.js   # 产业岗位路由
│   ├── antibody.js   # 概念抗体路由
│   ├── jobs.js       # 高薪岗位路由
│   ├── submissions.js # 用户提交路由
│   ├── stats.js      # 统计路由
│   ├── admin.js      # 管理路由
│   └── ai.js         # AI 路由（已下线）
├── services/         # 服务层（业务逻辑）
│   ├── terms.service.js
│   ├── graph.service.js
│   ├── compare.service.js
│   ├── career.service.js
│   ├── industry.service.js
│   ├── antibody.service.js
│   ├── jobs.service.js
│   ├── submissions.service.js
│   ├── stats.service.js
│   ├── admin.service.js
│   ├── dataquality.service.js
│   ├── cache.js      # 内存缓存
│   └── ...
├── middleware/       # 中间件
│   ├── security.js   # 安全中间件
│   └── logger.js     # 日志中间件
├── utils/            # 工具函数
│   ├── validator.js  # 参数校验
│   └── cacheKeys.js  # 缓存Key常量
├── public/           # 静态文件（管理后台）
├── server.js         # 入口文件
└── package.json
```

### 12.2 核心模块说明

#### 12.2.1 数据库层 (`backend/db/`)

**db/index.js** - 数据库核心管理

| 函数 | 说明 |
|------|------|
| `initDB()` | 初始化数据库（加载或创建） |
| `saveDB()` | 将内存数据库写入磁盘 |
| `startAutoSave()` | 启动自动保存（每分钟） |
| `prepare(sql)` | SQL 语句预编译 |
| `exec(sql)` | 执行 SQL |
| `markDirty()` | 标记脏数据，触发保存 |
| `getDb()` | 获取数据库实例 |

**数据库设计原则：**
1. `tongwuyiming.db` 是唯一数据源
2. 启动时将整个 DB 加载到内存
3. 写入后立即导出回磁盘
4. JSON 文件仅作为备份/迁移用

#### 12.2.2 路由层 (`backend/routes/`)

**路由结构：**

| 路由前缀 | 模块 | 说明 | 认证 |
|----------|------|------|------|
| `/api/v1/terms` | `routes/terms.js` | 词条查询/搜索/CRUD | 部分需要 |
| `/api/v1/graph` | `routes/graph.js` | 图谱数据 | 公开 |
| `/api/v1/comparisons` | `routes/compare.js` | 概念对比 | 部分需要 |
| `/api/v1/scenarios` | `routes/scenarios.js` | 情景还原 | 公开 |
| `/api/v1/career` | `routes/career.js` | 职业解构 | 部分需要 |
| `/api/v1/industry` | `routes/industry.js` | 产业岗位 | 部分需要 |
| `/api/v1/antibody` | `routes/antibody.js` | 概念抗体 | 部分需要 |
| `/api/v1/jobs` | `routes/jobs.js` | 高薪岗位 | 部分需要 |
| `/api/v1/submissions` | `routes/submissions.js` | 用户提交 | 部分需要 |
| `/api/v1/stats` | `routes/stats.js` | 统计与健康检查 | 公开 |
| `/api/v1/admin` | `routes/admin.js` | 管理接口 | x-admin-token |

#### 12.2.3 服务层 (`backend/services/`)

**terms.service.js** - 词条业务逻辑

| 函数 | 说明 |
|------|------|
| `getTerms(page, pageSize, discipline)` | 分页获取词条 |
| `searchTerms(query, limit)` | 搜索词条 |
| `getTermById(id)` | 获取单个词条 |
| `createTerm(data)` | 创建词条 |
| `updateTerm(id, updates)` | 更新词条 |
| `deleteTerm(id)` | 删除词条 |
| `getDisciplines()` | 获取学科列表 |
| `getHotTerms()` | 获取热门词条 |
| `getRecentTerms(limit)` | 获取最新词条 |
| `getRandomTerm(discipline)` | 随机词条 |

**cache.js** - 内存缓存

| 函数 | 说明 |
|------|------|
| `set(key, value, ttl?)` | 设置缓存 |
| `get(key)` | 获取缓存 |
| `remember(key, fn)` | 获取或生成缓存 |
| `invalidate(key)` | 失效缓存 |
| `invalidatePrefix(prefix)` | 按前缀失效 |
| `clearAll()` | 清空所有缓存 |

**validator.js** - 参数校验工具

| 函数 | 说明 |
|------|------|
| `parsePagination(page, pageSize)` | 解析分页参数 |
| `validateString(value, maxLen)` | 验证字符串 |
| `validateId(id)` | 验证ID格式 |
| `validateArray(arr)` | 验证数组 |
| `validateEnum(value, allowed)` | 验证枚举值 |

#### 12.2.4 中间件层 (`backend/middleware/`)

**security.js** - 安全中间件

| 中间件 | 说明 | 配置 |
|--------|------|------|
| `rateLimiter` | 通用限流 | 1000请求/分钟/IP |
| `searchRateLimiter` | 搜索限流 | 600请求/分钟/IP |
| `adminRateLimiter` | 管理接口限流 | 300请求/分钟/IP |
| `securityHeaders` | 安全响应头 | X-Content-Type-Options, X-Frame-Options |
| `bodySizeLimit` | 请求大小限制 | 最大1MB |
| `sqlInjectionCheck` | SQL注入检测 | 正则匹配危险模式 |
| `adminAuth` | 管理员认证 | x-admin-token |

**logger.js** - 日志中间件

| 特性 | 说明 |
|------|------|
| 请求ID | 每个请求生成唯一标识 |
| 响应时间 | 记录请求处理耗时 |
| 敏感字段过滤 | 自动过滤 token、密码等 |
| 用户标识 | 记录 IP、User-Agent |

---

## 十三、数据库设计

> 所有数据库表名均为中文，代码中通过 SQL 别名转换为英文字段名

### 13.1 核心表结构

#### 词条（词条主表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `词条ID` | TEXT | PRIMARY KEY | 词条唯一标识 |
| `学科` | TEXT | NOT NULL | 所属学科ID |
| `名称` | TEXT | NOT NULL | 术语名称 |
| `翻译` | TEXT | NOT NULL | 人话翻译 |
| `本质` | TEXT | NOT NULL | 本质解释 |
| `提示` | TEXT | NOT NULL | 防忽悠提示 |
| `跨学科别名` | TEXT | DEFAULT '[]' | 跨学科别名JSON |
| `热度` | INTEGER | DEFAULT 0 | 是否热门 |
| `创建时间` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

#### 学科（学科表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `学科ID` | TEXT | PRIMARY KEY | 学科ID |
| `学科名称` | TEXT | NOT NULL | 学科名称 |
| `颜色` | TEXT | DEFAULT '#6B7B5E' | 学科颜色 |
| `描述` | TEXT | DEFAULT '' | 学科描述 |
| `显示顺序` | INTEGER | DEFAULT 0 | 显示顺序 |

#### 图谱关系（图谱关系表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `关系ID` | INTEGER | PRIMARY KEY AUTOINCREMENT | 主键 |
| `源词条ID` | TEXT | NOT NULL | 源节点ID |
| `目标词条ID` | TEXT | NOT NULL | 目标节点ID |
| `关系标签` | TEXT | | 关系标签 |

#### 概念对比（概念对比表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `对比ID` | TEXT | PRIMARY KEY | 对比ID |
| `标题` | TEXT | NOT NULL | 对比标题 |
| `概念A名称` | TEXT | NOT NULL | 概念A名称 |
| `概念A学科` | TEXT | NOT NULL | 概念A学科 |
| `概念A通俗解释` | TEXT | NOT NULL | 概念A人话翻译 |
| `概念A表现` | TEXT | NOT NULL | 概念A症状 |
| `概念A类比` | TEXT | NOT NULL | 概念A类比 |
| `概念A解决` | TEXT | NOT NULL | 概念A解决办法 |
| `概念B名称` | TEXT | NOT NULL | 概念B名称 |
| `概念B学科` | TEXT | NOT NULL | 概念B学科 |
| `概念B通俗解释` | TEXT | NOT NULL | 概念B人话翻译 |
| `概念B表现` | TEXT | NOT NULL | 概念B症状 |
| `概念B类比` | TEXT | NOT NULL | 概念B类比 |
| `概念B解决` | TEXT | NOT NULL | 概念B解决办法 |
| `总结` | TEXT | NOT NULL | 对比总结 |
| `关系类型` | TEXT | DEFAULT '关联性' | 关系类型 |

#### 用户提交（用户提交表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `提交ID` | INTEGER | PRIMARY KEY AUTOINCREMENT | 主键 |
| `提交类型` | TEXT | DEFAULT 'pair' | 提交类型 |
| `术语1` | TEXT | | 第一个术语 |
| `术语2` | TEXT | | 第二个术语 |
| `解释` | TEXT | | 解释说明 |
| `示例` | TEXT | | 使用示例 |
| `联系方式` | TEXT | | 提交者联系方式 |
| `词条名称` | TEXT | | 词条名称 |
| `词条学科` | TEXT | | 词条学科 |
| `词条翻译` | TEXT | | 词条翻译 |
| `词条本质` | TEXT | | 词条本质 |
| `词条提示` | TEXT | | 词条提示 |
| `词条别名` | TEXT | DEFAULT '[]' | 词条别名 |
| `状态` | TEXT | DEFAULT 'pending' | 审核状态 |
| `审核备注` | TEXT | | 审核备注 |
| `创建时间` | INTEGER | | 创建时间 |
| `更新时间` | INTEGER | | 更新时间 |

> 更多表结构详情请参考 [数据库结构说明](../data/数据库结构说明.md)

### 13.2 索引设计

```sql
-- 词条索引
CREATE INDEX idx_terms_discipline ON 词条(学科);
CREATE INDEX idx_terms_name ON 词条(名称);

-- 图谱索引
CREATE INDEX idx_graph_source ON 图谱关系(源词条ID);
CREATE INDEX idx_graph_target ON 图谱关系(目标词条ID);

-- 职业解构索引
CREATE INDEX idx_career_category ON 职业解构(分类);
CREATE INDEX idx_career_stages_career ON 职业阶段(职业ID);

-- 岗位索引
CREATE INDEX idx_jobs_category ON 岗位(分类ID);
CREATE INDEX idx_job_stages_job ON 岗位学习阶段(岗位ID);
```

---

## 十四、API 接口

> 完整的 API 文档请参考 [API 参考文档](./API_REFERENCE.md)

### 14.1 接口总览

| 模块 | 端点前缀 | 主要接口 |
|------|---------|---------|
| 词条 | `/api/v1/terms` | 列表、搜索、详情、热门、最新、随机 |
| 知识图谱 | `/api/v1/graph` | 节点、关系 |
| 概念对比 | `/api/v1/comparisons` | 列表、增删改 |
| 情景还原 | `/api/v1/scenarios` | 列表 |
| 职业解构 | `/api/v1/career` | 列表、详情、分类、导入导出 |
| 产业岗位 | `/api/v1/industry` | 列表、详情 |
| 概念抗体 | `/api/v1/antibody` | 列表、分类、导入导出 |
| 高薪岗位 | `/api/v1/jobs` | 分类、列表、详情、阶段、技能 |
| 用户提交 | `/api/v1/submissions` | 提交、列表、审核 |
| 统计 | `/api/v1/stats` | 统计、健康检查、反馈 |
| 管理后台 | `/api/v1/admin` | 词条、学科、备份、仪表盘 |

### 14.2 统一响应格式

**成功响应：**
```json
{
  "success": true,
  "data": { ... }
}
```

**失败响应：**
```json
{
  "success": false,
  "error": { "code": "ERROR_CODE", "message": "错误描述" }
}
```

### 14.3 管理接口鉴权

管理接口必须在 HTTP Header 中携带：
```
x-admin-token: <你的 token>
```

---

## 十五、依赖关系

### 15.1 前端依赖

| 依赖 | 用途 |
|------|------|
| `react` / `react-dom` | 主框架 |
| `react-router-dom` | 路由管理 |
| `typescript` | 类型支持 |
| `tailwindcss` | 样式框架 |
| `@radix-ui/react-*` | UI 组件库 |
| `framer-motion` | 动画库 |
| `lucide-react` | 图标库 |
| `recharts` | 图表库 |
| `d3` | 力导向图 |
| `zod` | 数据验证 |
| `react-hook-form` | 表单处理 |
| `sonner` | 消息提示 |

### 15.2 后端依赖

| 依赖 | 用途 |
|------|------|
| `express` | 后端框架 |
| `sql.js` | SQLite 内存数据库 |
| `cors` | CORS 处理 |
| `compression` | 响应压缩 |
| `dotenv` | 环境变量 |
| `cheerio` | HTML 解析 |
| `express-rate-limit` | 请求限流 |

---

## 十六、运行与部署

> 快速部署请参考第一部分：[服务器部署指南](#五服务器部署指南)

### 16.1 环境变量

**backend/.env**

```env
NODE_ENV=production
PORT=3000
ADMIN_TOKEN=your_secure_token_here
FRONTEND_URL=http://your_server_ip
ALLOWED_ORIGINS=http://localhost:3001,http://your_server_ip
```

### 16.2 数据库管理

#### 初始化空数据库

```bash
cd backend
rm data/tongwuyiming.db
node db/init.js
```

#### 备份与恢复

```bash
# 备份
cp backend/data/tongwuyiming.db backend/data/backups/tongwuyiming_backup_$(date +%Y%m%d_%H%M%S).db

# 恢复
cp backend/data/backups/tongwuyiming_backup_xxx.db backend/data/tongwuyiming.db
pm2 restart my-website
```

---

## 十七、安全要点

### 17.1 限流策略

| 接口类型 | 限制 |
|----------|------|
| 全局公开接口 | 1000 请求/分钟/IP |
| 搜索接口 | 600 请求/分钟/IP |
| 管理接口 | 300 请求/分钟/IP |

### 17.2 安全中间件

- `securityHeaders`: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
- `sqlInjectionCheck`: 检测 SQL 注入模式
- `bodySizeLimit`: 限制请求体最大 1MB

### 17.3 数据安全

- `ADMIN_TOKEN` 不要提交到 Git
- 用户提交内容已转义，防止 XSS
- 定期备份数据库
- 敏感日志字段自动脱敏

---

## 十八、故障排查

> 常见问题快速排查请参考第一部分：[故障排查速查表](#七故障排查速查表)

---

## 相关文档

- [API 参考文档](./API_REFERENCE.md) - 完整的接口文档
- [数据库结构说明](../data/数据库结构说明.md) - 详细的表结构说明
- [代码审计报告](./CODE_AUDIT_REPORT.md) - 代码审计结果

---

*版本：v2.0 · 2026-06-24 · 项目手册与开发文档合并*
