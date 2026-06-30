/**
 * 前端通用类型 & 常量
 * 数据模型类型统一从 api/types re-export，避免重复定义
 */

// -- 从 api/types 统一 re-export -----
export type {
  TermAlias,
  TermEntry,
  DisciplineInfo,
  LearningGradient,
  CrossDisciplineEntry,
  Comparison,
  ComparisonConcept,
  ComparisonRow,
  Scenario,
  DialogueLine,
  SearchSuggestion,
  AIConfig,
} from '../api/types'

// -- 静态学科数据（前端渲染兜底） -----
//
// 全中文路线：id 直接使用数据库学科名称（如"数学""生物学"），
// 与 API 返回的 discipline 字段直接匹配，无需任何转换。
//
export const DISCIPLINES: { id: string; name: string; color: string; description: string }[] = [
  {
    id: '数学',
    name: '数学',
    color: '#5B7BA0',
    description:
      '同一个数学结构，在代数课上叫群，在物理课上叫对称性，在计算机图形学里叫变换矩阵——看懂包装纸，就不被忽悠。',
  },
  {
    id: '物理学',
    name: '物理学',
    color: '#6B9B8E',
    description:
      '物理学是自然科学的基石，同一个物理原理，在经典力学里叫一个名字，在量子力学里又换一个马甲。',
  },
  {
    id: '化学',
    name: '化学',
    color: '#9B7B5E',
    description:
      '化学研究物质的变化，从原子到分子，同一个反应在有机化学和无机化学里可能有完全不同的表述方式。',
  },
  {
    id: '生物学',
    name: '生物学',
    color: '#5B9B6E',
    description:
      '生命科学的术语体系，从细胞到生态系统，同一个生命现象在分子生物学和生态学里有不同的视角。',
  },
  {
    id: '跨学科',
    name: '跨学科',
    color: '#8B7D6B',
    description: '不同学科对同一个概念的不同叫法，同一本质在不同语境下的马甲大集合。',
  },
  {
    id: '计算机',
    name: '计算机',
    color: '#4A9B8E',
    description:
      'AI领域每天都在造新词。大模型、涌现、对齐……这些听起来高大上的术语，本质几乎都是传统计算机科学、数学里已有概念的重新包装。',
  },
  {
    id: '经济学',
    name: '经济学',
    color: '#B8783A',
    description:
      '经济学是包装术语的重灾区。同一个日常现象，在经济学里可能被包装成外部性、边际效用递减、信息不对称——本质往往简单得惊人。',
  },
  {
    id: '法律政策',
    name: '法律政策',
    color: '#6B7B5E',
    description:
      '法律和政策是故意不说人话的重灾区。同一个简单道理，在民法典里叫一个名字，在政府文件里又换一个名字。',
  },
  {
    id: '医学心理',
    name: '医学心理',
    color: '#A45D6A',
    description:
      '医学是术语壁垒最高的领域。同一个生理现象，在临床叫一个名字，在病理学叫另一个名字，在患者耳朵里变成不治之症。',
  },
  {
    id: '控制论',
    name: '控制论',
    color: '#7B6BA0',
    description: '用控制论作为通用语言，把不同学科中同物异名的概念还原为统一的数学结构与逻辑本质。',
  },
]
