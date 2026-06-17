-- ============================================================
-- 同物异名 - SQLite 数据库表结构
-- 执行: node db/init.js 自动建表 + 导数据
-- ============================================================

-- 词条主表
CREATE TABLE IF NOT EXISTS 词条 (
    词条ID          TEXT PRIMARY KEY,
    学科          TEXT NOT NULL,
    名称        TEXT NOT NULL,
    翻译 TEXT NOT NULL,
    本质     TEXT NOT NULL,
    提示         TEXT NOT NULL,
    跨学科别名     TEXT DEFAULT '[]',           -- [{"discipline":"...","name":"..."}]
    热度         INTEGER DEFAULT 0,
    创建时间  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 认知梯度路径
CREATE TABLE IF NOT EXISTS 学习路径 (
    路径ID          INTEGER PRIMARY KEY AUTOINCREMENT,
    词条ID     TEXT NOT NULL,
    步骤顺序  INTEGER NOT NULL,
    步骤类型   TEXT NOT NULL,
    内容     TEXT NOT NULL,
    FOREIGN KEY (词条ID) REFERENCES 词条(词条ID) ON DELETE CASCADE
);

-- 图谱关系
CREATE TABLE IF NOT EXISTS 图谱关系 (
    关系ID          INTEGER PRIMARY KEY AUTOINCREMENT,
    源节点ID   TEXT NOT NULL,
    目标节点ID   TEXT NOT NULL,
    关系标签       TEXT,
    UNIQUE(源节点ID, 目标节点ID)
);

-- 概念对比
CREATE TABLE IF NOT EXISTS 概念对比 (
    对比ID          TEXT PRIMARY KEY,
    标题       TEXT NOT NULL,
    A概念名称       TEXT NOT NULL,
    A概念学科 TEXT NOT NULL,
    A概念平述      TEXT NOT NULL,
    A概念症状    TEXT NOT NULL,
    A概念类比    TEXT NOT NULL,
    A概念修正        TEXT NOT NULL,
    B概念名称       TEXT NOT NULL,
    B概念学科 TEXT NOT NULL,
    B概念平述      TEXT NOT NULL,
    B概念症状    TEXT NOT NULL,
    B概念类比    TEXT NOT NULL,
    B概念修正        TEXT NOT NULL,
    总结     TEXT NOT NULL,
    关系类型 TEXT DEFAULT '关联性'
);

-- 情景还原
CREATE TABLE IF NOT EXISTS 情景还原 (
    情景ID      TEXT PRIMARY KEY,
    场景   TEXT NOT NULL,
    教训  TEXT NOT NULL
);

-- 情景对话
CREATE TABLE IF NOT EXISTS 情景对话 (
    对话ID          INTEGER PRIMARY KEY AUTOINCREMENT,
    情景ID TEXT NOT NULL,
    对话顺序  INTEGER NOT NULL,
    说话者     TEXT NOT NULL,
    对话内容        TEXT NOT NULL,
    高亮内容   TEXT,
    FOREIGN KEY (情景ID) REFERENCES 情景还原(情景ID) ON DELETE CASCADE
);

-- 用户反馈
CREATE TABLE IF NOT EXISTS 用户反馈 (
    反馈ID          INTEGER PRIMARY KEY AUTOINCREMENT,
    反馈类型        TEXT NOT NULL,
    反馈内容     TEXT NOT NULL,
    关联词条ID     TEXT,
    联系方式     TEXT,
    创建时间  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 学科表
CREATE TABLE IF NOT EXISTS 学科 (
    学科ID          TEXT PRIMARY KEY,
    学科名称        TEXT NOT NULL,
    学科颜色       TEXT DEFAULT '#6B7B5E',
    学科描述 TEXT DEFAULT '',
    显示顺序 INTEGER DEFAULT 0,
    创建时间  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 新增：概念抗体、职业解构、产业拆解
-- ============================================================

-- 概念抗体表
CREATE TABLE IF NOT EXISTS 概念抗体 (
    抗体ID          TEXT PRIMARY KEY,
    词条ID     TEXT NOT NULL,
    抗体标题       TEXT NOT NULL,
    抗体描述 TEXT NOT NULL,
    抗体类别    TEXT NOT NULL,
    抗体内容     TEXT NOT NULL,
    创建时间  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (词条ID) REFERENCES 词条(词条ID) ON DELETE CASCADE
);

-- 职业解构主表
CREATE TABLE IF NOT EXISTS 职业解构 (
    职业ID          TEXT PRIMARY KEY,
    职业类别    TEXT NOT NULL,
    职业名称        TEXT NOT NULL,
    薪资范围      TEXT,
    学历要求   TEXT,
    学习时长    TEXT,
    职业描述 TEXT NOT NULL,
    显示顺序 INTEGER DEFAULT 0,
    创建时间  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 职业解构阶段表
CREATE TABLE IF NOT EXISTS 职业阶段 (
    阶段ID          INTEGER PRIMARY KEY AUTOINCREMENT,
    职业ID   TEXT NOT NULL,
    阶段顺序 INTEGER NOT NULL,
    阶段名称  TEXT NOT NULL,
    阶段副标题 TEXT,
    阶段时长    TEXT,
    创建时间  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (职业ID) REFERENCES 职业解构(职业ID) ON DELETE CASCADE
);

-- 职业技能表
CREATE TABLE IF NOT EXISTS 职业技能 (
    技能ID          INTEGER PRIMARY KEY AUTOINCREMENT,
    职业ID   TEXT NOT NULL,
    阶段ID    INTEGER NOT NULL,
    技能顺序 INTEGER NOT NULL,
    技能图标        TEXT,
    技能名称        TEXT NOT NULL,
    技能描述 TEXT NOT NULL,
    FOREIGN KEY (职业ID) REFERENCES 职业解构(职业ID) ON DELETE CASCADE,
    FOREIGN KEY (阶段ID) REFERENCES 职业阶段(阶段ID) ON DELETE CASCADE
);

-- 职业资源表
CREATE TABLE IF NOT EXISTS 职业资源 (
    资源ID          INTEGER PRIMARY KEY AUTOINCREMENT,
    职业ID   TEXT NOT NULL,
    资源类型        TEXT NOT NULL,
    资源标题       TEXT NOT NULL,
    资源描述 TEXT,
    资源链接        TEXT,
    创建时间  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (职业ID) REFERENCES 职业解构(职业ID) ON DELETE CASCADE
);

-- 职业项目表
CREATE TABLE IF NOT EXISTS 职业项目 (
    项目ID          INTEGER PRIMARY KEY AUTOINCREMENT,
    职业ID   TEXT NOT NULL,
    项目标题       TEXT NOT NULL,
    项目步骤       TEXT NOT NULL,
    创建时间  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (职业ID) REFERENCES 职业解构(职业ID) ON DELETE CASCADE
);

-- 产业拆解主表
CREATE TABLE IF NOT EXISTS 产业拆解 (
    产业ID          TEXT PRIMARY KEY,
    产业名称        TEXT NOT NULL,
    产业描述 TEXT NOT NULL,
    核心描述   TEXT DEFAULT '从芯片到系统，拆解万亿产业链的核心岗位与利润分配',
    显示顺序 INTEGER DEFAULT 0,
    创建时间  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 产业链环节表
CREATE TABLE IF NOT EXISTS 产业链环节 (
    环节ID          INTEGER PRIMARY KEY AUTOINCREMENT,
    产业ID TEXT NOT NULL,
    环节顺序  INTEGER NOT NULL,
    环节名称        TEXT NOT NULL,
    环节描述 TEXT NOT NULL,
    环节角色       TEXT,
    利润占比 TEXT,
    FOREIGN KEY (产业ID) REFERENCES 产业拆解(产业ID) ON DELETE CASCADE
);

-- 产业岗位表
CREATE TABLE IF NOT EXISTS 产业岗位 (
    岗位ID          INTEGER PRIMARY KEY AUTOINCREMENT,
    产业ID TEXT NOT NULL,
    环节ID     INTEGER NOT NULL,
    岗位名称        TEXT NOT NULL,
    岗位描述 TEXT NOT NULL,
    岗位薪资      TEXT,
    岗位要求 TEXT,
    FOREIGN KEY (产业ID) REFERENCES 产业拆解(产业ID) ON DELETE CASCADE,
    FOREIGN KEY (环节ID) REFERENCES 产业链环节(环节ID) ON DELETE CASCADE
);

-- ============================================================
-- 岗位管理表
-- ============================================================

-- 岗位分类表
CREATE TABLE IF NOT EXISTS 岗位分类 (
    分类ID INTEGER PRIMARY KEY AUTOINCREMENT,
    分类名称 TEXT NOT NULL,
    分类图标 TEXT,
    显示顺序 INTEGER DEFAULT 0,
    创建时间 DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 岗位主表
CREATE TABLE IF NOT EXISTS 岗位 (
    岗位ID INTEGER PRIMARY KEY AUTOINCREMENT,
    分类ID INTEGER NOT NULL,
    岗位标识 TEXT NOT NULL,
    岗位标题 TEXT NOT NULL,
    所属公司 TEXT NOT NULL,
    薪资范围 TEXT,
    学历要求 TEXT,
    工作经验 TEXT,
    岗位介绍 TEXT NOT NULL,
    显示顺序 INTEGER DEFAULT 0,
    创建时间 DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (分类ID) REFERENCES 岗位分类(分类ID) ON DELETE CASCADE
);

-- 岗位学习阶段表
CREATE TABLE IF NOT EXISTS 岗位学习阶段 (
    阶段ID INTEGER PRIMARY KEY AUTOINCREMENT,
    岗位ID INTEGER NOT NULL,
    阶段序号 INTEGER NOT NULL,
    阶段标题 TEXT NOT NULL,
    阶段副标题 TEXT,
    阶段时长 TEXT,
    显示顺序 INTEGER DEFAULT 0,
    FOREIGN KEY (岗位ID) REFERENCES 岗位(岗位ID) ON DELETE CASCADE
);

-- 岗位技能表
CREATE TABLE IF NOT EXISTS 岗位技能 (
    技能ID INTEGER PRIMARY KEY AUTOINCREMENT,
    阶段ID INTEGER NOT NULL,
    技能名称 TEXT NOT NULL,
    技能描述 TEXT,
    显示顺序 INTEGER DEFAULT 0,
    FOREIGN KEY (阶段ID) REFERENCES 岗位学习阶段(阶段ID) ON DELETE CASCADE
);

-- 岗位学习资源表
CREATE TABLE IF NOT EXISTS 岗位学习资源 (
    资源ID INTEGER PRIMARY KEY AUTOINCREMENT,
    岗位ID INTEGER NOT NULL,
    资源类型 TEXT,
    资源标题 TEXT NOT NULL,
    资源描述 TEXT,
    资源链接 TEXT,
    显示顺序 INTEGER DEFAULT 0,
    FOREIGN KEY (岗位ID) REFERENCES 岗位(岗位ID) ON DELETE CASCADE
);

-- 岗位项目表
CREATE TABLE IF NOT EXISTS 岗位项目 (
    项目ID INTEGER PRIMARY KEY AUTOINCREMENT,
    岗位ID INTEGER NOT NULL,
    项目标题 TEXT NOT NULL,
    项目步骤 TEXT NOT NULL, -- JSON数组格式
    FOREIGN KEY (岗位ID) REFERENCES 岗位(岗位ID) ON DELETE CASCADE,
    UNIQUE(岗位ID)
);

-- 岗位知识卡片表
CREATE TABLE IF NOT EXISTS 岗位知识卡片 (
    卡片ID INTEGER PRIMARY KEY AUTOINCREMENT,
    岗位ID INTEGER NOT NULL,
    术语 TEXT NOT NULL,
    解释说明 TEXT NOT NULL,
    显示顺序 INTEGER DEFAULT 0,
    FOREIGN KEY (岗位ID) REFERENCES 岗位(岗位ID) ON DELETE CASCADE
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_词条_学科 ON 词条(学科);
CREATE INDEX IF NOT EXISTS idx_词条_名称 ON 词条(名称);
CREATE INDEX IF NOT EXISTS idx_图谱_源节点 ON 图谱关系(源节点ID);
CREATE INDEX IF NOT EXISTS idx_图谱_目标节点 ON 图谱关系(目标节点ID);
CREATE INDEX IF NOT EXISTS idx_概念抗体_词条 ON 概念抗体(词条ID);
CREATE INDEX IF NOT EXISTS idx_职业解构_类别 ON 职业解构(职业类别);
CREATE INDEX IF NOT EXISTS idx_职业阶段_职业 ON 职业阶段(职业ID);
CREATE INDEX IF NOT EXISTS idx_职业技能_阶段 ON 职业技能(阶段ID);
CREATE INDEX IF NOT EXISTS idx_产业链环节_产业 ON 产业链环节(产业ID);
CREATE INDEX IF NOT EXISTS idx_产业岗位_环节 ON 产业岗位(环节ID);
CREATE INDEX IF NOT EXISTS idx_岗位_分类 ON 岗位(分类ID);
CREATE INDEX IF NOT EXISTS idx_岗位阶段_岗位 ON 岗位学习阶段(岗位ID);
CREATE INDEX IF NOT EXISTS idx_岗位技能_阶段 ON 岗位技能(阶段ID);
CREATE INDEX IF NOT EXISTS idx_岗位资源_岗位 ON 岗位学习资源(岗位ID);
CREATE INDEX IF NOT EXISTS idx_岗位项目_岗位 ON 岗位项目(岗位ID);
CREATE INDEX IF NOT EXISTS idx_知识卡片_岗位 ON 岗位知识卡片(岗位ID);

-- ============================================================
-- 词条历史版本（每次编辑只记录变更字段）
-- ============================================================
CREATE TABLE IF NOT EXISTS 词条历史 (
    历史ID INTEGER PRIMARY KEY AUTOINCREMENT,
    词条ID TEXT NOT NULL,
    字段名称 TEXT NOT NULL,   -- name / translation / essence / tip / hot
    旧值 TEXT,
    新值 TEXT,
    创建时间 INTEGER NOT NULL,
    FOREIGN KEY (词条ID) REFERENCES 词条(词条ID) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_词条历史_词条ID ON 词条历史(词条ID);
CREATE INDEX IF NOT EXISTS idx_词条历史_创建时间 ON 词条历史(创建时间 DESC);