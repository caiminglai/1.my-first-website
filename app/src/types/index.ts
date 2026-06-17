// 学科类型 - 动态，不再使用联合类型
export type Discipline = string

// 学科信息（与后端 disciplines 表一致，作为前端渲染兜底）
export const DISCIPLINES: { id: string; name: string; color: string; description: string }[] = [
  {
    id: 'math',
    name: '数学',
    color: '#5B7BA0',
    description:
      '同一个数学结构，在代数课上叫群，在物理课上叫对称性，在计算机图形学里叫变换矩阵——看懂包装纸，就不被忽悠。',
  },
  {
    id: 'physics',
    name: '物理学',
    color: '#6B9B8E',
    description:
      '物理学是自然科学的基石，同一个物理原理，在经典力学里叫一个名字，在量子力学里又换一个马甲。',
  },
  {
    id: 'chem',
    name: '化学',
    color: '#9B7B5E',
    description:
      '化学研究物质的变化，从原子到分子，同一个反应在有机化学和无机化学里可能有完全不同的表述方式。',
  },
  {
    id: 'bio',
    name: '生物学',
    color: '#5B9B6E',
    description:
      '生命科学的术语体系，从细胞到生态系统，同一个生命现象在分子生物学和生态学里有不同的视角。',
  },
  {
    id: 'cross',
    name: '跨学科',
    color: '#8B7D6B',
    description: '不同学科对同一个概念的不同叫法，同一本质在不同语境下的马甲大集合。',
  },
  {
    id: 'cs',
    name: 'AI/计算机',
    color: '#4A9B8E',
    description:
      'AI领域每天都在造新词。大模型、涌现、对齐……这些听起来高大上的术语，本质几乎都是传统计算机科学、数学里已有概念的重新包装。',
  },
  {
    id: 'econ',
    name: '经济学',
    color: '#B8783A',
    description:
      '经济学是包装术语的重灾区。同一个日常现象，在经济学里可能被包装成外部性、边际效用递减、信息不对称——本质往往简单得惊人。',
  },
  {
    id: 'law',
    name: '法律/政策',
    color: '#6B7B5E',
    description:
      '法律和政策是故意不说人话的重灾区。同一个简单道理，在民法典里叫一个名字，在政府文件里又换一个名字。',
  },
  {
    id: 'med',
    name: '医学/心理',
    color: '#A45D6A',
    description:
      '医学是术语壁垒最高的领域。同一个生理现象，在临床叫一个名字，在病理学叫另一个名字，在患者耳朵里变成不治之症。',
  },
  {
    id: 'cyber',
    name: '控制论',
    color: '#7B6BA0',
    description: '用控制论作为通用语言，把不同学科中同物异名的概念还原为统一的数学结构与逻辑本质。',
  },
]

// 词条类型 - 与 API 统一
export interface TermAlias {
  discipline: Discipline
  name: string
}

export interface TermEntry {
  id: string
  discipline: Discipline
  name: string
  translation: string
  essence: string
  tip: string
  aliases?: TermAlias[]
  hot?: boolean
}

// 认知梯度路径
export interface LearningGradient {
  use: string
  path: string[]
}

// 学科信息 - 与 API 统一
export interface DisciplineInfo {
  id: string
  name: string
  color: string
  description: string
}

// 跨学科词条
export interface CrossDisciplineEntry {
  id: string
  concept: string
  names: { discipline: Discipline; name: string }[]
  summary: string
}

// 图谱节点
export interface GraphNode {
  id: string
  name: string
  discipline: Discipline
  disciplineName: string
  color: string
  translation: string
  radius: number
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

// 图谱链接
export interface GraphLink {
  source: string | GraphNode
  target: string | GraphNode
  label: string
}

// 概念对比 - 旧格式（前端兼容）
export interface Comparison {
  id: string
  title: string
  conceptA: ComparisonConcept
  conceptB: ComparisonConcept
  summary: string
}

export interface ComparisonConcept {
  name: string
  discipline: Discipline
  plain: string
  symptom: string
  analogy: string
  fix: string
}

// 情景还原
export interface Scenario {
  id: string
  scene: string
  dialogue: DialogueLine[]
  termRefs: string[]
  lesson: string
}

export interface DialogueLine {
  speaker: string
  text: string
  highlight?: string
  emotion?: string
}
