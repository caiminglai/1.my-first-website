import Navbar from '@/sections/Navbar'
import Footer from '@/sections/Footer'

interface TimelineNode {
  era: string
  name: string
  essence: string
  context: string
  color: string
}

const TIMELINE_NODES: TimelineNode[] = [
  {
    era: '1940s',
    name: '控制论 Cybernetics',
    essence: '复杂系统的输入输出调节',
    context:
      '维纳研究通信、生物和工程系统中的反馈与控制机制。用"控制论"包装一个古老的本质：让系统通过信息反馈维持稳定。',
    color: '#7B6BA0',
  },
  {
    era: '1950s',
    name: '信息论 Information Theory',
    essence: '用概率分布衡量信号的不确定性',
    context: '香农用"熵"量化信息。本质依然是对信号进行建模与编码，但换了一个更科学化的名字。',
    color: '#5B7BA0',
  },
  {
    era: '1956',
    name: '人工智能 Artificial Intelligence',
    essence: '让机器做原本需要智能/判断的事',
    context:
      '达特茅斯会议。用"人工智能"替换"自动化"、"符号推理"等。本质还是对输入做规则化处理并输出结果。',
    color: '#4A9B8E',
  },
  {
    era: '1980s',
    name: '专家系统 Expert Systems',
    essence: '把人工总结的规则写成 if-then 逻辑',
    context:
      '用知识库 + 推理机解决特定领域问题。本质还是由人类总结的模式匹配，只是换了一个更"专业"的名字。',
    color: '#B8783A',
  },
  {
    era: '1986',
    name: '神经网络 Neural Networks',
    essence: '多层可微函数的参数拟合',
    context:
      '反向传播算法复兴。将"统计回归"改造成"模拟神经元"，本质仍是通过梯度下降对数据做函数拟合。',
    color: '#A45D6A',
  },
  {
    era: '2006',
    name: '深度学习 Deep Learning',
    essence: '多层神经网络的参数拟合',
    context:
      'Hinton 提出"深度信念网络"。将"多层神经网络"改名为"深度学习"，本质仍然是通过反向传播学习参数。',
    color: '#6B7B5E',
  },
  {
    era: '2010s',
    name: '机器学习 Machine Learning',
    essence: '从数据中学习规律做预测/分类',
    context:
      '统计学习理论、SVM、随机森林被统一包装成"机器学习"。本质仍然是对数据的模式识别与拟合。',
    color: '#5B9B6E',
  },
  {
    era: '2012',
    name: '认知计算 / Cognitive Computing',
    essence: '处理非结构化输入并给出判断',
    context: 'IBM Watson 等被包装为"认知计算"，本质依然是对文本/图像做复杂模式识别与检索。',
    color: '#9B7B5E',
  },
  {
    era: '2017',
    name: 'Transformer / 注意力机制',
    essence: '对序列元素做加权组合与变换',
    context:
      'Attention Is All You Need。将"加权求和"升级为"自注意力"，但本质仍是对输入做线性/非线性变换。',
    color: '#D4853B',
  },
  {
    era: '2018',
    name: '大语言模型 / LLM',
    essence: '根据上文概率预测下一个 token',
    context: 'GPT、BERT 兴起。将"语言模型"放大后改称为"大语言模型"，本质仍是自回归概率建模。',
    color: '#E8A85A',
  },
  {
    era: '2020s',
    name: 'AI 对齐 / AGI / 生成式 AI',
    essence: '复杂系统的输入输出调节 + 人类偏好拟合',
    context:
      'RLHF、对齐、生成式人工智能被包装为更宏大的概念。本质仍然是：通过反馈调整系统行为，让它输出符合人类期望。',
    color: '#D4853B',
  },
]

export default function TermTimeline() {
  return (
    <div className="min-h-screen bg-warm-bg dark:bg-warm-bg">
      <Navbar
        onSearch={() => {}}
        onRandom={() => {}}
        onFilterDiscipline={() => {}}
        activeFilter="all"
      />

      <main className="pt-24 pb-10 px-4 lg:px-6">
        <div className="max-w-[960px] mx-auto">
          {/* 标题区 */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="w-1 h-10 rounded-full bg-gradient-to-b from-[#E8A85A] to-[#D4853B]" />
              <h1 className="text-3xl sm:text-4xl font-bold text-warm-dark dark:text-warm-text font-display">
                马甲演变史
              </h1>
              <span className="w-1 h-10 rounded-full bg-gradient-to-b from-[#E8A85A] to-[#D4853B]" />
            </div>
            <p className="text-lg sm:text-xl text-warm-accent font-medium mb-2">
              同一个本质，不同年代的不同包装
            </p>
            <p className="text-sm sm:text-base text-warm-text max-w-[680px] mx-auto leading-relaxed">
              从控制论到人工智能 ——
              看一个概念如何被反复命名。每一次改名，往往只是用新的理论包装了同一件事：对输入做处理并输出期望的结果。
            </p>
          </div>

          {/* 时间线 */}
          <div className="relative pl-8 sm:pl-14">
            {/* 左侧竖线 */}
            <div className="absolute left-3 sm:left-7 top-2 bottom-2 w-[3px] rounded-full bg-gradient-to-b from-[#E8A85A] via-[#D4853B] to-[#E8A85A]" />

            {TIMELINE_NODES.map((node) => (
              <div key={node.name} className="relative mb-8 last:mb-0">
                {/* 圆形节点 */}
                <div
                  className="absolute -left-[22px] sm:-left-[26px] top-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-[3px] border-warm-bg dark:border-warm-bg shadow-sm flex items-center justify-center"
                  style={{ backgroundColor: node.color }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-warm-bg dark:bg-warm-bg" />
                </div>

                {/* 卡片 */}
                <div className="bg-white dark:bg-warm-card rounded-xl border border-warm-border shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6 ml-2 sm:ml-4">
                  {/* 年代 + 名称 */}
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3">
                    <span
                      className="inline-block text-sm font-bold px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: `${node.color}15`,
                        color: node.color,
                      }}
                    >
                      {node.era}
                    </span>
                    <h2 className="text-lg sm:text-xl font-semibold text-warm-dark dark:text-warm-text font-display">
                      {node.name}
                    </h2>
                  </div>

                  {/* 本质解释 */}
                  <div className="mb-3 pl-2 border-l-2" style={{ borderColor: node.color }}>
                    <div className="text-xs text-warm-text mb-1">本质解释</div>
                    <div className="text-sm sm:text-base font-medium text-warm-accent">
                      {node.essence}
                    </div>
                  </div>

                  {/* 背景/目的 */}
                  <div className="text-sm sm:text-[15px] text-warm-text leading-relaxed">
                    {node.context}
                  </div>
                </div>
              </div>
            ))}

            {/* 底部总结 */}
            <div className="relative mt-10">
              <div className="absolute -left-[22px] sm:-left-[26px] top-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-[#E8A85A] to-[#D4853B] shadow-md" />
              <div className="ml-2 sm:ml-4 bg-gradient-to-br from-[#E8A85A]/10 to-[#D4853B]/10 dark:from-[#E8A85A]/15 dark:to-[#D4853B]/15 rounded-xl border border-[#D4853B]/30 p-5 sm:p-6">
                <div className="text-lg font-semibold text-warm-dark dark:text-warm-text font-display mb-2">
                  🎯 一条主线
                </div>
                <p className="text-sm sm:text-base text-warm-text leading-relaxed">
                  从维纳的"控制论"到今天的"大语言模型"，几十年间诞生了十几个不同的名称。
                  它们的核心本质始终如一：
                  <span className="font-semibold text-warm-accent">
                    对复杂系统的输入进行处理，输出期望的结果，并通过反馈不断调节
                  </span>
                  。 每一次改名，也许只是换了一件更适合那个年代的外衣。
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
