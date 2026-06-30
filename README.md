# 同物异名 (Tong Wu Yi Ming)

跨学科概念还原库 —— 同一个本质，在不同学科里被反复命名。

本项目是一个交互式的知识可视化网站，通过概念图谱、情景还原、术语时间线等方式，帮助读者理解不同学科中"名字不同、本质相同"的概念，并培养对伪科学的辨识能力。

## 技术栈

**前端**：React 19 + TypeScript + Vite 7 + Tailwind CSS 3 + shadcn/ui + D3.js + Framer Motion

**后端**：Express.js + better-sqlite3 (SQLite) + OpenAI API

## 项目结构

```
├── app/                # 前端（React + Vite）
│   ├── src/
│   │   ├── api/        # API 调用层
│   │   ├── components/ # 共享组件
│   │   ├── data/       # 静态数据
│   │   ├── pages/      # 页面组件
│   │   ├── sections/   # 布局区块
│   │   └── index.css   # 全局样式（含暗色模式适配）
│   └── package.json
├── backend/            # 后端（Express）
│   ├── db/             # 数据库连接
│   ├── middleware/      # 安全中间件（限流、CORS、SQL 注入检测）
│   ├── routes/         # API 路由
│   ├── scripts/        # 运维脚本（同步、备份）
│   ├── services/       # 业务服务（Obsidian 同步等）
│   └── server.js       # 入口
├── data/               # SQLite 数据库文件
├── docs/               # 项目文档
│   ├── API接口文档.md
│   ├── 代码说明.md
│   ├── 部署指南.md
│   ├── 方案A-四大模块操作指南.md
│   └── 科学不装_操作手册.html
├── obsidian/           # Obsidian 知识库（与数据库双向同步）
├── scripts/            # 启动脚本
└── README.md
```

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装与运行

```bash
# 1. 安装前端依赖
cd app && npm install

# 2. 安装后端依赖
cd ../backend && npm install

# 3. 配置后端环境变量
cp .env.example .env
# 编辑 .env 填入实际配置（OPENAI_API_KEY 等）

# 4. 启动后端（默认端口 3000）
cd ../backend && node server.js

# 5. 启动前端（默认端口 3001）
cd ../app && npm run dev
```

访问 `http://localhost:3001/twym/` 查看网站。

### 常用脚本

```bash
# 前端
cd app
npm run dev          # 开发服务器
npm run build        # 生产构建
npm run typecheck    # TypeScript 类型检查
npm run lint         # ESLint 检查
npm run format       # Prettier 格式化
```

## 主要功能

- **概念图谱**：D3.js 力导向图展示跨学科概念关系
- **情景还原**：对话式场景重现概念诞生的历史背景
- **术语时间线**：按年代展示术语演变脉络
- **概念抗体**：帮助读者识别伪科学的检查工具
- **职业解构**：高薪技术岗位的能力模型与成长路径
- **技术解构**：技术概念的本质还原与关联分析
- **AI 问答**：基于 RAG 的智能问答（需配置 OpenAI API Key）

## 文档

- [API 接口文档](docs/API接口文档.md) — 后端接口规范与限流策略
- [代码说明](docs/代码说明.md) — 架构设计、数据模型、组件说明
- [部署指南](docs/部署指南.md) — 生产环境部署与运维
- [四大模块操作指南](docs/方案A-四大模块操作指南.md) — 管理后台操作说明
- [操作手册](docs/科学不装_操作手册.html) — 可视化操作手册（HTML）

## 常用运维脚本

```bash
cd backend

# Obsidian 双向同步
npm run sync:to-obsidian      # 数据库 → Obsidian（全量写入）
npm run sync:from-obsidian     # Obsidian → 数据库（解析 Markdown 写入 DB）

# 数据库备份
npm run backup                 # 备份数据库到 data/backups/
```

## 许可证

MIT
