import sqlite3
import os
import json
import re
from datetime import datetime

def safe_filename(name):
    """清理文件名中的非法字符"""
    return re.sub(r'[\\/:*?"<>|]', '_', name).strip()

def export_to_obsidian(db_path, vault_path):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # 创建目录结构
    dirs = [
        f"{vault_path}/00-主页",
        f"{vault_path}/01-词条原子",
        f"{vault_path}/02-学科MOC",
        f"{vault_path}/03-概念对比",
        f"{vault_path}/04-情景还原",
        f"{vault_path}/05-图谱关系",
        f"{vault_path}/99-模板",
    ]
    for d in dirs:
        os.makedirs(d, exist_ok=True)

    # ========== 1. 导出学科 & 创建 MOC ==========
    cursor.execute("SELECT 学科ID, 学科名称, 颜色, 描述, 显示顺序 FROM 学科 ORDER BY 显示顺序")
    subjects = {}
    for row in cursor.fetchall():
        subj_id, subj_name, color, desc, order = row
        subjects[subj_id] = {
            'name': subj_name,
            'color': color or '',
            'desc': desc or '',
            'order': order or 0
        }
        # 创建学科子目录
        os.makedirs(f"{vault_path}/01-词条原子/{subj_name}", exist_ok=True)

        # 生成学科 MOC
        moc_content = f"""---
tags: MOC, 学科
学科ID: {subj_id}
颜色: {color or ''}
---

# {subj_name} MOC

{desc or ''}

## 该学科下的词条
```dataview
TABLE 翻译, 本质, 热度
FROM "01-词条原子/{subj_name}"
SORT 热度 DESC
```

## 学科统计
```dataview
TABLE length(rows) as 词条数
FROM "01-词条原子/{subj_name}"
GROUP BY 学科名称
```
"""
        with open(f"{vault_path}/02-学科MOC/{subj_name} MOC.md", 'w', encoding='utf-8') as f:
            f.write(moc_content)

    # ========== 2. 导出词条 ==========
    cursor.execute("""
        SELECT 词条ID, 学科, 名称, 翻译, 本质, 提示, 跨学科别名, 热度, 创建时间 
        FROM 词条
    """)
    terms = {}
    term_name_to_id = {}
    for row in cursor.fetchall():
        term_id, subject, name, translation, essence, tip, aliases, heat, created = row
        terms[term_id] = {
            'name': name,
            'subject': subject,
            'translation': translation or '',
            'essence': essence or '',
            'tip': tip or '',
            'aliases': aliases or '',
            'heat': heat or 0,
            'created': created or ''
        }
        term_name_to_id[name] = term_id

        # 解析跨学科别名为链接
        alias_links = ""
        if aliases:
            try:
                alias_list = json.loads(aliases)
                if isinstance(alias_list, list):
                    alias_links = ", ".join([f"[[{a}]]" for a in alias_list if a])
                else:
                    alias_links = str(aliases)
            except:
                alias_links = str(aliases)

        subj_name = subjects.get(subject, {}).get('name', '未分类')
        safe_name = safe_filename(name)
        file_path = f"{vault_path}/01-词条原子/{subj_name}/{safe_name}.md"

        content = f"""---
词条ID: {term_id}
学科: {subject}
学科名称: {subj_name}
翻译: {translation or ''}
热度: {heat or 0}
创建时间: {created or ''}
tags: 词条, {subj_name}
---

# {name}

> **通俗翻译**：{translation or '暂无'}

## 本质
{essence or '暂无'}

## 记忆提示
{tip or '暂无'}

## 跨学科别名
{alias_links or '暂无'}

## 关联概念
_以下关联来自图谱关系表_

"""
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

    # ========== 3. 导出图谱关系（双向链接） ==========
    cursor.execute("SELECT 源词条ID, 目标词条ID, 关系标签 FROM 图谱关系")
    relations = cursor.fetchall()

    # 收集每个词条的关联
    term_relations = {}
    for src, tgt, label in relations:
        if src not in term_relations:
            term_relations[src] = []
        if tgt not in term_relations:
            term_relations[tgt] = []

        src_name = terms.get(src, {}).get('name', src)
        tgt_name = terms.get(tgt, {}).get('name', tgt)

        term_relations[src].append((tgt_name, label or '关联'))
        term_relations[tgt].append((src_name, label or '关联'))

    # 追加到词条文件
    for term_id, rels in term_relations.items():
        name = terms.get(term_id, {}).get('name', term_id)
        subject = terms.get(term_id, {}).get('subject', '')
        subj_name = subjects.get(subject, {}).get('name', '未分类')
        safe_name = safe_filename(name)
        file_path = f"{vault_path}/01-词条原子/{subj_name}/{safe_name}.md"

        if os.path.exists(file_path):
            with open(file_path, 'a', encoding='utf-8') as f:
                for rel_name, rel_label in rels:
                    f.write(f"- [[{rel_name}]] （{rel_label}）\n")

    # 生成独立的图谱关系汇总页
    graph_content = "---\ntags: 图谱, 关系\n---\n\n# 知识图谱关系汇总\n\n| 源概念 | 关系 | 目标概念 |\n|--------|------|----------|\n"
    for src, tgt, label in relations:
        src_name = terms.get(src, {}).get('name', src)
        tgt_name = terms.get(tgt, {}).get('name', tgt)
        graph_content += f"| [[{src_name}]] | {label or '关联'} | [[{tgt_name}]] |\n"

    with open(f"{vault_path}/05-图谱关系/图谱关系汇总.md", 'w', encoding='utf-8') as f:
        f.write(graph_content)

    # ========== 4. 导出概念对比 ==========
    cursor.execute("""
        SELECT 对比ID, 标题, 概念A名称, 概念A学科, 概念A通俗解释, 概念A表现, 
               概念A类比, 概念A解决, 概念B名称, 概念B学科, 概念B通俗解释, 
               概念B表现, 概念B类比, 概念B解决, 总结, 关系类型
        FROM 概念对比
    """)
    compare_count = 0
    for row in cursor.fetchall():
        (comp_id, title, a_name, a_subj, a_expl, a_perf, a_analogy, a_solve,
         b_name, b_subj, b_expl, b_perf, b_analogy, b_solve, summary, rel_type) = row

        compare_count += 1
        safe_title = safe_filename(title)

        content = f"""---
对比ID: {comp_id}
概念A: {a_name}
概念A学科: {a_subj}
概念B: {b_name}
概念B学科: {b_subj}
关系类型: {rel_type or '关联性'}
tags: 对比
---

# {title}

## 概念对比表

| 维度 | [[{a_name}]] | [[{b_name}]] |
|------|-------------|-------------|
| **学科** | {a_subj} | {b_subj} |
| **通俗解释** | {a_expl or '暂无'} | {b_expl or '暂无'} |
| **表现形式** | {a_perf or '暂无'} | {b_perf or '暂无'} |
| **类比** | {a_analogy or '暂无'} | {b_analogy or '暂无'} |
| **解决方法** | {a_solve or '暂无'} | {b_solve or '暂无'} |

## 一句话总结
> {summary or '暂无'}

## 关联词条
- [[{a_name}]]
- [[{b_name}]]

## 相关对比
```dataview
TABLE 概念A, 概念B, 关系类型
FROM "03-概念对比"
WHERE contains(概念A, "{a_name}") OR contains(概念B, "{a_name}") OR contains(概念A, "{b_name}") OR contains(概念B, "{b_name}")
```
"""
        with open(f"{vault_path}/03-概念对比/{safe_title}.md", 'w', encoding='utf-8') as f:
            f.write(content)

    # ========== 5. 导出情景还原 ==========
    cursor.execute("SELECT 情景ID, 场景, 启示 FROM 情景")
    scenarios = {}
    for row in cursor.fetchall():
        scen_id, scene, revelation = row
        scenarios[scen_id] = {
            'scene': scene or '',
            'revelation': revelation or ''
        }

        safe_scene = safe_filename(scene[:30] if scene else scen_id)
        content = f"""---
情景ID: {scen_id}
tags: 情景
---

# 情景：{scene or scen_id}

## 场景描述
{scene or '暂无'}

## 启示
{revelation or '暂无'}

## 对话还原

"""
        with open(f"{vault_path}/04-情景还原/{safe_scene}.md", 'w', encoding='utf-8') as f:
            f.write(content)

    # 导出情景对话
    cursor.execute("""
        SELECT 情景ID, 对话顺序, 说话者, 内容, 重点标记 
        FROM 情景对话 
        ORDER BY 情景ID, 对话顺序
    """)

    for row in cursor.fetchall():
        scen_id, order, speaker, content_text, highlight = row
        scene_info = scenarios.get(scen_id, {})
        scene_title = scene_info.get('scene', scen_id)[:30]
        safe_scene = safe_filename(scene_title)
        file_path = f"{vault_path}/04-情景还原/{safe_scene}.md"

        if os.path.exists(file_path):
            with open(file_path, 'a', encoding='utf-8') as f:
                hl_start = "**" if highlight else ""
                hl_end = "**" if highlight else ""
                f.write(f"{order}. **{speaker}**：{hl_start}{content_text or ''}{hl_end}\n\n")

    # ========== 6. 生成主页仪表盘 ==========
    home_content = f"""---
tags: 主页, MOC
---

# 同物异名知识体系

> 从数据库自动导出的完整知识网络
> 
> 📊 **{len(terms)}** 个词条 | **{len(subjects)}** 个学科 | **{len(relations)}** 组关系 | **{compare_count}** 个概念对比 | **{len(scenarios)}** 个情景

---

## 学科导航

```dataview
TABLE 颜色, length(rows) as 词条数
FROM "02-学科MOC"
FLATTEN file.outlinks
GROUP BY file.name
```

## 热门词条 🔥

```dataview
TABLE 学科名称, 翻译, 本质
FROM "01-词条原子"
WHERE 热度 = 1
SORT 热度 DESC
LIMIT 15
```

## 最新概念对比

```dataview
TABLE 概念A, 概念B, 关系类型
FROM "03-概念对比"
SORT file.ctime DESC
LIMIT 10
```

## 情景案例

```dataview
TABLE 情景ID, 场景
FROM "04-情景还原"
SORT file.ctime DESC
```

## 知识图谱

点击 Obsidian 右侧的 **图谱视图**（Graph View）查看概念关联网络。

建议开启：
- **显示标签**：查看学科分类
- **局部图谱**：选中某个词条，查看其上下游关联

---

*生成时间：{datetime.now().strftime("%Y-%m-%d %H:%M")}*
"""
    with open(f"{vault_path}/00-主页/同物异名知识体系.md", 'w', encoding='utf-8') as f:
        f.write(home_content)

    # ========== 7. 生成模板 ==========
    term_template = """---
词条ID: 
学科: 
翻译: 
热度: 0
创建时间: {{date:YYYY-MM-DD}}
tags: 词条
---

# {{title}}

> **通俗翻译**：

## 本质

## 记忆提示

## 跨学科别名

## 关联概念
"""
    with open(f"{vault_path}/99-模板/词条模板.md", 'w', encoding='utf-8') as f:
        f.write(term_template)

    compare_template = """---
对比ID: 
概念A: 
概念A学科: 
概念B: 
概念B学科: 
关系类型: 关联性
tags: 对比
---

# {{title}}

## 概念对比表

| 维度 | 概念A | 概念B |
|------|-------|-------|
| **学科** | | |
| **通俗解释** | | |
| **表现形式** | | |
| **类比** | | |
| **解决方法** | | |

## 一句话总结
> 

## 关联词条
"""
    with open(f"{vault_path}/99-模板/对比模板.md", 'w', encoding='utf-8') as f:
        f.write(compare_template)

    scenario_template = """---
情景ID: 
tags: 情景
---

# 情景：{{title}}

## 场景描述

## 启示

## 对话还原

1. **角色A**：
2. **角色B**：
"""
    with open(f"{vault_path}/99-模板/情景模板.md", 'w', encoding='utf-8') as f:
        f.write(scenario_template)

    # ========== 8. 生成 README ==========
    readme = f"""# 同物异名知识体系 - Obsidian Vault

## 数据概览

- **词条**：{len(terms)} 个
- **学科**：{len(subjects)} 个
- **图谱关系**：{len(relations)} 组
- **概念对比**：{compare_count} 个
- **情景还原**：{len(scenarios)} 个

## 目录结构

```
📁 00-主页/          → 入口仪表盘（Dataview）
📁 01-词条原子/      → 按学科分类的词条笔记（核心资产）
📁 02-学科MOC/       → 学科内容地图（MOC）
📁 03-概念对比/      → 同物异名对比分析
📁 04-情景还原/      → 场景对话与启示
📁 05-图谱关系/      → 关系汇总表
📁 99-模板/          → 新建笔记模板
```

## 必备插件

1. **Dataview** — 仪表盘查询（必须安装，否则主页无法显示）
2. **Templater** — 模板自动化（可选）
3. **Breadcrumbs** — 层级导航（可选）

## 使用建议

1. 打开 `00-主页/同物异名知识体系.md` 作为入口
2. 通过学科 MOC 浏览特定领域
3. 在任意词条中点击 `[[双向链接]]` 跳转关联概念
4. 使用 Ctrl/Cmd + 点击链接，在新面板打开对比
5. 在图谱视图中查看全局关联网络

## 自定义扩展

空表（职业解构、产业岗位、概念抗体、高薪技术岗）的数据可以在 Obsidian 中直接新建笔记，使用 `99-模板/` 中的模板保持格式统一。
"""
    with open(f"{vault_path}/README.md", 'w', encoding='utf-8') as f:
        f.write(readme)

    conn.close()
    print(f"✅ 导出完成！")
    print(f"📁 Vault 路径：{os.path.abspath(vault_path)}")
    print(f"📊 统计：{len(terms)} 词条 | {len(subjects)} 学科 | {len(relations)} 关系 | {compare_count} 对比 | {len(scenarios)} 情景")
    print(f"\n⚠️  提醒：请在 Obsidian 中安装 Dataview 插件，否则主页仪表盘无法显示。")

if __name__ == "__main__":
    # 用法：把脚本和 tongwuyiming.db 放在同一目录，运行：
    # python export_obsidian.py
    export_to_obsidian("tongwuyiming.db", "./tongwuyiming-obsidian")
