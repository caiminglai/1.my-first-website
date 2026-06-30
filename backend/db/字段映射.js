const FIELD_MAPPING = {
  词条ID: "id",
  学科: "discipline",
  名称: "name",
  翻译: "translation",
  本质: "essence",
  提示: "tip",
  跨学科别名: "aliases",
  热度: "hot",
  创建时间: "created_at",
  
  路径ID: "id",
  路径词条ID: "term_id",
  步骤顺序: "step_order",
  步骤类型: "step_type",
  内容: "content",
  
  关系ID: "id",
  源节点ID: "source_id",
  目标节点ID: "target_id",
  关系标签: "label",
  
  对比ID: "id",
  标题: "title",
  A概念名称: "concept_a_name",
  A概念学科: "concept_a_discipline",
  A概念平述: "concept_a_plain",
  A概念症状: "concept_a_symptom",
  A概念类比: "concept_a_analogy",
  A概念修正: "concept_a_fix",
  B概念名称: "concept_b_name",
  B概念学科: "concept_b_discipline",
  B概念平述: "concept_b_plain",
  B概念症状: "concept_b_symptom",
  B概念类比: "concept_b_analogy",
  B概念修正: "concept_b_fix",
  总结: "summary",
  关系类型: "relationship_type",
  
  情景ID: "id",
  场景: "scene",
  教训: "lesson",
  
  对话ID: "id",
  情景ID_对话: "scenario_id",
  对话顺序: "line_order",
  说话者: "speaker",
  对话内容: "text",
  高亮内容: "highlight",
  
  反馈ID: "id",
  反馈类型: "type",
  反馈内容: "content",
  关联词条ID: "term_id",
  联系方式: "contact",
  
  学科ID: "id",
  学科名称: "name",
  学科颜色: "color",
  学科描述: "description",
  显示顺序: "display_order",
  
  抗体ID: "id",
  抗体标题: "title",
  抗体描述: "description",
  抗体类别: "category",
  抗体内容: "content",
  
  职业ID: "id",
  职业类别: "category",
  职业名称: "name",
  薪资范围: "salary",
  学历要求: "education",
  学习时长: "duration",
  职业描述: "description",
  
  阶段ID: "id",
  阶段顺序: "stage_order",
  阶段名称: "stage_name",
  阶段副标题: "stage_subtitle",
  阶段时长: "duration",
  
  技能ID: "id",
  技能顺序: "skill_order",
  技能图标: "icon",
  技能名称: "name",
  技能描述: "description",
  
  资源ID: "id",
  资源类型: "type",
  资源标题: "title",
  资源描述: "description",
  资源链接: "link",
  
  项目ID: "id",
  项目标题: "title",
  项目步骤: "steps",
  
  产业ID: "id",
  产业名称: "name",
  产业描述: "description",
  核心描述: "core_desc",
  
  环节ID: "id",
  环节顺序: "link_order",
  环节名称: "name",
  环节描述: "description",
  环节角色: "roles",
  利润占比: "profit_share",
  
  岗位ID: "id",
  岗位名称: "name",
  岗位描述: "description",
  岗位薪资: "salary",
  岗位要求: "requirements",
  
  分类ID: "category_id",
  分类名称: "name",
  分类图标: "icon",
  
  岗位标识: "job_key",
  岗位标题: "title",
  所属公司: "company",
  工作经验: "duration",
  岗位介绍: "intro",
  
  阶段序号: "stage_number",
  阶段标题: "title",
  阶段副标题: "subtitle",
  
  卡片ID: "id",
  术语: "term",
  解释说明: "explanation",
  
  历史ID: "id",
  字段名称: "field_name",
  旧值: "old_value",
  新值: "new_value",
};

function mapFields(obj) {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => mapFields(item));
  }
  const mapped = {};
  const usedKeys = new Set(); // 记录已处理的英文字段
  
  // 先处理所有中文字段，映射到英文字段
  for (const [key, value] of Object.entries(obj)) {
    if (FIELD_MAPPING[key]) {
      const englishKey = FIELD_MAPPING[key];
      mapped[englishKey] = mapFields(value);
      usedKeys.add(englishKey);
    }
  }
  
  // 再处理英文字段（未映射的字段）
  for (const [key, value] of Object.entries(obj)) {
    if (!FIELD_MAPPING[key]) {
      // 如果这个英文字段还没有被映射添加过，保留它
      if (!usedKeys.has(key)) {
        mapped[key] = mapFields(value);
      }
    }
  }
  
  return mapped;
}

module.exports = {
  FIELD_MAPPING,
  mapFields,
};