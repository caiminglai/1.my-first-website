// ============================================================
// 职业解构模块数据 -- 来自《认知防忽悠手册_全球整合版》
// 涵盖：看门狗经济学、认知偏差、全球鬼话、检测工具箱
// ============================================================

// --- 卷三：看门狗经济学 ---

export interface WatchdogIndustry {
  name: string
  description: string
  rating: number // 1-5 星
  painPoints: string[]
  escapeRoute: string
}

export const WATCHDOG_LAWS = [
  {
    title: '价值不可见性',
    subtitle: '防御成功 = 无事发生 = 老板觉得你在摸鱼',
    content: '只有失败时才被看见，但这时你先被问责。平时价值≈0，甚至为负。',
  },
  {
    title: '预算逆周期性',
    subtitle: '经济好时先砍看门狗，危机时才被迫加预算',
    content: '永远被动，永远滞后。不创造直接收入，裁员名单上永远有你。',
  },
  {
    title: '背锅优先性',
    subtitle: '出事时看门狗是第一责任人；立功时造血部门是第一领奖人',
    content: '风险与收益永远不对等。造血的吃肉，看门的啃骨头，骨头还是别人啃完的。',
  },
]

export const WATCHDOG_FORMULA = {
  formula: '看门狗价值 = 威胁强度 × 危机概率',
  note: '平时价值≈0（甚至为负），战时价值极高。',
}

export const WATCHDOG_INDUSTRIES: WatchdogIndustry[] = [
  {
    name: '网络安全',
    description: '平时被嫌摸鱼，被攻击时背锅。培训机构割韭菜重灾区。',
    rating: 5,
    painPoints: ['防住了=老板觉得本来就没危险', '没防住=全是你的错', '培训广告夸大缺口'],
    escapeRoute: '转向安全产品商业化（造血）或安全咨询（按项目收费）',
  },
  {
    name: '保安/物业',
    description: '业主嫌物业费高，冲突时第一责任人但权限最小。',
    rating: 4,
    painPoints: ['安全感幻觉的载体', '权限最小责任最大', '收入天花板极低'],
    escapeRoute: '物业管理（带资产运营）或社区服务创业',
  },
  {
    name: '保险（理赔外）',
    description: '平时觉得白交钱，出险时千方百计拒赔。风险来了先护自己的钱。',
    rating: 3,
    painPoints: ['销售端：信息不对称套利', '理赔端：千方百计拒赔', '客户信任度极低'],
    escapeRoute: '保险科技（InsurTech）产品设计或独立保险经纪',
  },
  {
    name: 'IT运维/技术支持',
    description: '服务器稳定=没事干，卡顿=怎么搞的。核心困境：你是厕所修理工。',
    rating: 4,
    painPoints: ['稳定=看不见你', '故障=你怎么搞的', '24小时待命'],
    escapeRoute: 'SRE/平台工程（开发方向）或云架构咨询',
  },
  {
    name: '合规/审计/法务',
    description: '平时嫌你卡流程，出事时背锅。能创造商业价值的法务除外。',
    rating: 3,
    painPoints: ['被认为拖慢业务', '出事第一个找你', '纯合规无商业价值'],
    escapeRoute: '商业法务（参与交易）或合规科技（RegTech）',
  },
]

export const HEMATOPOIESIS_TRAITS = [
  '直接参与价值交换（能换成钱或降低别人成本）',
  '成果可量化、可展示（销售额、用户数、代码行数）',
  '危机时仍有议价权（经济下行时，企业死保直接挣钱的部门）',
]

export const HEMATOPOIESIS_LEVELS = [
  {
    level: '一级造血',
    desc: '直接签单',
    examples: '销售/BD、效果广告/增长黑客、供应链优化',
  },
  {
    level: '二级造血',
    desc: '创造可卖的东西',
    examples: '研发工程师、工业设计师、芯片工程师、内容创作者',
  },
  {
    level: '三级造血',
    desc: '放大已有价值',
    examples: '业务向数据分析师、产研PM、解决方案工程师',
  },
]

export const MIGRATION_RULES = [
  '优先选「有实体产品、能直接卖钱、你的管理经验能复用」的岗位',
  '不要直接转「纯防御性岗位」（看门狗陷阱，价值不可见）',
  '不要直接转「纯运维」（看门狗陷阱，平时没事干，出事背黑锅）',
  '不要报「零基础学XX」培训班（大概率割韭菜，学完还是看门狗）',
  '用造血岗位买时间，用时间换终极目标。这不是妥协，是战略迂回。',
]

// --- 卷四：认知偏差 24 条 ---

export interface CognitiveBias {
  id: number
  name: string
  description: string
  countermeasure: string
}

export const COGNITIVE_BIASES: CognitiveBias[] = [
  {
    id: 1,
    name: '计划谬误',
    description: '低估任务完成时间。「这个月肯定能学完」',
    countermeasure: '参考同类任务的平均完成时间，不用自己的「内部感觉」',
  },
  {
    id: 2,
    name: '禀赋效应',
    description: '高估自己拥有的东西。「学了4年XX，扔了可惜」',
    countermeasure: '问自己「如果今天从零开始，我还会选择这个吗？」',
  },
  {
    id: 3,
    name: '确认偏误',
    description: '只找支持自己观点的证据。「XX确实国家重视」',
    countermeasure: '主动寻找反面证据，设立「魔鬼代言人」角色',
  },
  {
    id: 4,
    name: '锚定效应',
    description: '被第一个数字绑架。「原价2万，现价1万」',
    countermeasure: '决策前先独立估算真实价值，不被对方数字影响',
  },
  {
    id: 5,
    name: '可得性启发',
    description: '越容易想起的事被认为越常见。「抖音上都是转XX成功的」',
    countermeasure: '用数据替代印象，搜索「失败案例」而不是「成功案例」',
  },
  {
    id: 6,
    name: '权威偏误',
    description: '因为对方是「老师/专家/总监」就无条件相信',
    countermeasure: '追问「这个结论的依据是什么？数据样本有多大？」',
  },
  {
    id: 7,
    name: '行动偏误',
    description: '觉得「做点什么」比「什么都不做」好。「先报个班再说」',
    countermeasure: 'Kahneman：Sometimes doing nothing is the best action.',
  },
  {
    id: 8,
    name: '后见之明偏误',
    description: '「我早就知道会这样」——实际上事前根本没预判',
    countermeasure: '做决策时写下预测，事后对照',
  },
  {
    id: 9,
    name: '自我服务偏误',
    description: '成功归自己，失败怪环境',
    countermeasure: '用第三方视角复盘，区分可控与不可控因素',
  },
  {
    id: 10,
    name: '基本归因错误',
    description: '把别人的行为归因为性格，把自己的归因为情境',
    countermeasure: '反过来——把别人的归因于情境，把自己的归因于性格',
  },
  {
    id: 11,
    name: '框架效应',
    description: '同一信息换个说法你就改变决策。「90%存活率」vs「10%死亡率」',
    countermeasure: '转换成统一框架（全正面或全负面）再比较',
  },
  {
    id: 12,
    name: '损失厌恶',
    description: '失去100元的痛苦 > 得到100元的快乐（2-3倍强度）',
    countermeasure: '假设自己已经拥有，问自己「愿意花多少钱放弃它？」',
  },
  {
    id: 13,
    name: '现状偏见',
    description: '倾向于维持现状，害怕改变',
    countermeasure: '设定「如果我现在不在这个岗位，我会选择进来吗？」',
  },
  {
    id: 14,
    name: '聚光灯效应',
    description: '高估别人对自己的关注度。「转行失败了别人会笑话我」',
    countermeasure: '人们90%的时间在想自己，只有10%的时间想别人',
  },
  {
    id: 15,
    name: '蔡格尼克效应',
    description: '对未完成的任务记忆更深。培训机构利用此制造焦虑',
    countermeasure: '把大任务拆成小任务，逐个完成',
  },
  {
    id: 16,
    name: '刻板印象威胁',
    description: '担心被贴上负面标签，反而表现更差。「35岁转行肯定不行」',
    countermeasure: '把标签从「我是什么样的人」改成「我在做什么样的事」',
  },
  {
    id: 17,
    name: '虚假共识效应',
    description: '高估别人与自己意见一致的程度。「大家都觉得XX好」',
    countermeasure: '做匿名调查，而不是问身边人的意见',
  },
  {
    id: 18,
    name: '知识诅咒',
    description: '一旦知道某件事，就无法想象不知道它的样子',
    countermeasure: '学习时假装自己在教一个完全不懂的人',
  },
  {
    id: 19,
    name: 'Normalize偏差',
    description: '对反复出现的异常现象习以为常。「996很正常」',
    countermeasure: '设立「异常日志」，记录不正常事件，定期回顾',
  },
  {
    id: 20,
    name: '乐观偏误',
    description: '相信自己比平均水平更不容易遭遇坏事',
    countermeasure: '参考基础概率——如果80%的人失败，你凭什么是那20%？',
  },
  {
    id: 21,
    name: '达克效应',
    description: '能力越低的人越自信，能力越高的人越谦虚',
    countermeasure: '觉得自己很懂的时候，可能正是你不懂的信号',
  },
  {
    id: 22,
    name: '峰终定律',
    description: '对经历的记忆只取决于高峰和结束时的感受',
    countermeasure: '面试最后5分钟决定成败；离职时保持良好关系',
  },
  {
    id: 23,
    name: '道德许可效应',
    description: '做了一件「好事」后，允许自己做「坏事」',
    countermeasure: '把道德账户和绩效账户分开，不互相抵消',
  },
  {
    id: 24,
    name: '沉没成本谬误',
    description: '「都花了2万了再坚持一下」——越陷越深',
    countermeasure: 'Kahneman：Ignore sunk costs. 只看未来收益。',
  },
]

// --- 卷九：8 句全球鬼话 ---

export interface GhostTalk {
  id: number
  chinese: string
  english: string
  speaker: string
  logic: string
  counter: string
  quote: string
  author: string
}

export const GHOST_TALKS: GhostTalk[] = [
  {
    id: 1,
    chinese: '行业风口来了，赶紧上车',
    english: 'The industry is booming, get in now',
    speaker: '培训机构、自媒体、销售',
    logic: '幸存者偏差 + 产业后备军',
    counter: '风口的猪飞上天，摔下来的猪谁统计了？上车的人多了，车会不会塌？',
    quote: 'If you see a get-rich-quick scheme, it is probably a scheme.',
    author: 'Naval Ravikant',
  },
  {
    id: 2,
    chinese: '国家重视，政策扶持',
    english: 'The government is supporting this sector',
    speaker: '培训机构、招商加盟、地方政府',
    logic: '看门狗经济学 + 兴亡周期律',
    counter: '国家重视=底层赚钱吗？兴也苦，亡也苦，扶持的是企业还是个人？',
    quote: 'The desire for more positive experience is itself a negative experience.',
    author: 'Mark Manson',
  },
  {
    id: 3,
    chinese: '越老越吃香，技术傍身',
    english: 'The older you get, the more valuable you become',
    speaker: '培训机构、老工程师、HR',
    logic: '路径依赖 + 内卷',
    counter: '技术越普及，后备军越多，我的议价权在哪？老的是经验还是包袱？',
    quote: 'The most important investment you can make is in your own adaptability.',
    author: 'Yuval Harari',
  },
  {
    id: 4,
    chinese: '灵活就业，自由创业',
    english: 'Be your own boss, work flexibly',
    speaker: '平台、微商、加盟招商',
    logic: '平台资本主义 + 数据圈地',
    counter: '灵活的是时间，还是被算法锁死的空间？我在创业还是在交地租？',
    quote: 'You are not working for yourself if you do not own the customer.',
    author: 'Naval Ravikant',
  },
  {
    id: 5,
    chinese: '管理岗稳定，升上去就好了',
    english: 'Management is stable, just get promoted',
    speaker: '老板、HR、中层领导',
    logic: '管理封建主义 + 狗屁工作',
    counter: '管理岗是在造血还是在当领主的家臣？手下有人干活还是手下都是演员？',
    quote: 'Bullshit jobs are often management jobs.',
    author: 'David Graeber',
  },
  {
    id: 6,
    chinese: '公司文化好，团队氛围棒',
    english: 'We have great company culture',
    speaker: 'HR、面试官、企业文化宣传',
    logic: '情感劳动 + 奶头乐理论',
    counter: '氛围好是真性情流露还是深层扮演？这是归属感还是精神麻醉剂？',
    quote: 'If you are always trying to be happy, you will never actually be happy.',
    author: 'Mark Manson',
  },
  {
    id: 7,
    chinese: '学门技术，不怕失业',
    english: 'Learn a skill and you will never be unemployed',
    speaker: '培训机构、技校、家长',
    logic: '产业后备军 + 成本中心陷阱',
    counter: '技术学会了，岗位在哪？这是造血技能还是看门狗技能？供需比是多少？',
    quote:
      'Specific knowledge is knowledge that you cannot be trained for. If society can train you, it can train someone else and replace you.',
    author: 'Naval Ravikant',
  },
  {
    id: 8,
    chinese: '细节决定成败，态度决定一切',
    english: 'Attitude is everything, details determine success',
    speaker: '老板、中层、鸡汤文',
    logic: '蝴蝶效应 + 情感劳动',
    counter: '这个细节影响的是5%的优化还是50%的成败？系统层面的问题解决了没有？',
    quote:
      'People are not accustomed to thinking hard, and are often content to trust a plausible judgment that quickly comes to mind.',
    author: 'Daniel Kahneman',
  },
]

// --- 卷八：14 问交叉检测表 ---

export interface DetectionQuestion {
  id: number
  talk: string
  concept: string
  question: string
}

export const DETECTION_QUESTIONS: DetectionQuestion[] = [
  {
    id: 1,
    talk: '「行业风口来了，赶紧上车」',
    concept: '幸存者偏差 + 产业后备军',
    question: '风口的猪飞上天，摔下来的猪谁统计了？上车的人多了，车会不会塌？',
  },
  {
    id: 2,
    talk: '「国家重视，政策扶持」',
    concept: '看门狗经济学 + 兴亡周期律',
    question: '国家重视=底层赚钱吗？兴也苦，亡也苦，扶持的是企业还是个人？',
  },
  {
    id: 3,
    talk: '「越老越吃香，技术傍身」',
    concept: '路径依赖 + 内卷',
    question: '技术越普及，后备军越多，我的议价权在哪？老的是经验还是包袱？',
  },
  {
    id: 4,
    talk: '「灵活就业，自由创业」',
    concept: '平台资本主义 + 数据圈地',
    question: '灵活的是时间，还是被算法锁死的空间？我在创业还是在交地租？',
  },
  {
    id: 5,
    talk: '「管理岗稳定，升上去就好了」',
    concept: '管理封建主义 + 狗屁工作',
    question: '管理岗是在造血还是在当领主的家臣？手下有人干活还是手下都是演员？',
  },
  {
    id: 6,
    talk: '「公司文化好，团队氛围棒」',
    concept: '情感劳动 + 奶头乐理论',
    question: '氛围好是真性情流露还是深层扮演？这是归属感还是精神麻醉剂？',
  },
  {
    id: 7,
    talk: '「学门技术，不怕失业」',
    concept: '产业后备军 + 成本中心陷阱',
    question: '技术学会了，岗位在哪？这是造血技能还是看门狗技能？',
  },
  {
    id: 8,
    talk: '「投入就有回报，坚持就是胜利」',
    concept: '沉没成本绑架 + 路径依赖',
    question: '坚持的是方向还是执念？及时止损算不算一种胜利？',
  },
  {
    id: 9,
    talk: '「大家都在卷，你不卷就落后」',
    concept: '内卷 + 防御性支出不可见性',
    question: '卷的是蛋糕还是空气？投入产出比是正的还是负的？',
  },
  {
    id: 10,
    talk: '「公司需要这个岗位，你很重要」',
    concept: '看门狗经济学 + 狗屁工作',
    question: '需要=重视=给钱多吗？还是只是需要一个背锅的/填表的？',
  },
  {
    id: 11,
    talk: '「细节决定成败，态度决定一切」',
    concept: '蝴蝶效应 + 情感劳动',
    question: '这个细节影响的是5%的优化还是50%的成败？系统层面的问题解决了没有？',
  },
  {
    id: 12,
    talk: '「我们要引入竞争机制」',
    concept: '鲶鱼效应 + 囚徒困境',
    question: '这个机制的收益归谁？成本谁承担？鲶鱼最后会不会变成新的捕食者？',
  },
  {
    id: 13,
    talk: '「这是灰犀牛，必须提前布局」',
    concept: '灰犀牛 + 看门狗经济学',
    question: '这个灰犀牛过去5年发生了几次？每次损失多少？投入100万能降多少概率？',
  },
  {
    id: 14,
    talk: '「这是黑天鹅，谁也预测不了」',
    concept: '黑天鹅 + 灰犀牛',
    question: '预警报告在哪？当时为什么没action？这是真黑天鹅，还是假装黑天鹅的灰犀牛？',
  },
]

// --- 同物异名大表 ---

export interface SynonymEntry {
  phenomenon: string
  economics: string
  sociology: string
  management: string
  psychology: string
  daily: string
}

export const SYNONYM_TABLE: SynonymEntry[] = [
  {
    phenomenon: '只花钱不赚钱的岗位',
    economics: '成本中心 / 非生产性劳动',
    sociology: '维持性劳动 / 防御性劳动',
    management: '支持部门 / 后台职能',
    psychology: '—',
    daily: '后勤 / 辅助 / 不直接创造价值',
  },
  {
    phenomenon: '平时没用 / 出事背锅',
    economics: '预防性悖论 / 负外部性',
    sociology: '结构性暴力 / 风险下沉',
    management: '风险管理 / 合规成本',
    psychology: '责任分散 / 替罪羊效应',
    daily: '看门狗 / 填线宝宝',
  },
  {
    phenomenon: '割韭菜',
    economics: '信息不对称套利 / 人力资本变现',
    sociology: '文化资本陷阱 / 阶级再生产',
    management: '培训产业化 / 焦虑经济',
    psychology: '恐惧诉求 / 锚定效应',
    daily: '知识付费 / 副业变现',
  },
  {
    phenomenon: '内卷',
    economics: '边际收益递减 / 零和博弈',
    sociology: '地位竞争 / 符号消费',
    management: '精益管理 / 流程优化',
    psychology: '习得性无助 / 自我感动',
    daily: '996福报 / 奋斗者协议',
  },
  {
    phenomenon: '忽悠话术',
    economics: '信号传递 / 租金抽取',
    sociology: '意识形态 / 话语霸权',
    management: '企业文化 / 价值观对齐',
    psychology: '确认偏误 / 权威服从',
    daily: '赋能 / 抓手 / 闭环 / 颗粒度',
  },
  {
    phenomenon: '管理中层',
    economics: '代理成本 / 监督者剩余',
    sociology: '科层制 / 官僚体系',
    management: '组织能力建设 / 领导力发展',
    psychology: '—',
    daily: '家臣 / 封建随从',
  },
  {
    phenomenon: '被删除的真相',
    economics: '信息租金 / 准入壁垒',
    sociology: '符号暴力 / 认知封锁',
    management: '舆情管理 / 品牌保护',
    psychology: '可得性启发 / 记忆篡改',
    daily: '404 / 内容审核 / 社区公约',
  },
  {
    phenomenon: '工人没有议价权',
    economics: '劳动力商品化 / 买方垄断',
    sociology: '去技能化 / 原子化',
    management: '人力资源优化 / 组织效能',
    psychology: 'learned helplessness',
    daily: '你不干 / 有的是人干',
  },
  {
    phenomenon: '假装在工作',
    economics: 'X-非效率 / 隐性失业',
    sociology: '狗屁工作 / 仪式性劳动',
    management: '组织冗余 / 战略储备',
    psychology: '认知失调 / 表层扮演',
    daily: '摸鱼 / 表演式加班',
  },
]

// --- 全球大师框架 ---

export interface MasterFramework {
  name: string
  book: string
  keyConcepts: string[]
  quotes: string[]
}

export const MASTER_FRAMEWORKS: MasterFramework[] = [
  {
    name: 'Daniel Kahneman',
    book: '《思考，快与慢》',
    keyConcepts: ['系统1/系统2', '24个认知偏差', '损失厌恶', '锚定效应'],
    quotes: ['People are not accustomed to thinking hard.', 'Ignore sunk costs.'],
  },
  {
    name: 'Naval Ravikant',
    book: '《The Almanack of Naval Ravikant》',
    keyConcepts: ['Specific Knowledge', '四大杠杆', '复利效应', '逃离竞争'],
    quotes: ['Escape competition through authenticity.', 'Play stupid games, win stupid prizes.'],
  },
  {
    name: 'Mark Manson',
    book: '《The Subtle Art of Not Giving a F*ck》',
    keyConcepts: ['价值观筛选', '问题承担', '死亡意识', '不在乎的艺术'],
    quotes: ['The desire for more positive experience is itself a negative experience.'],
  },
  {
    name: 'Yuval Noah Harari',
    book: '《21 Lessons for the 21st Century》',
    keyConcepts: ['AI与就业', '持续学习', '故事与意义', '身体与意识'],
    quotes: ['In a world deluged by irrelevant information, clarity is power.'],
  },
]

// --- 卷零：5 个认知地图坐标 ---

export const COGNITIVE_MAP_POINTS = [
  {
    title: '系统作恶不需要坏人',
    content:
      '坏人作恶需要动机，系统作恶只需要KPI。理解这一点，你就不会把愤怒指向某个具体的人，而是指向结构本身。',
    quote: 'Play stupid games, win stupid prizes.',
    author: 'Naval Ravikant',
  },
  {
    title: '信息的价值在于它被删除的程度',
    content:
      '平台上活着的内容，是它们想让你看的；平台上死了的（被删的），才是它们害怕你知道的。删除行为本身暴露权力边界。',
    quote: 'In a world deluged by irrelevant information, clarity is power.',
    author: 'Yuval Harari',
  },
  {
    title: '单个词是子弹，概念网络才是火力网',
    content:
      '知道「沉没成本」只能让你少亏一次钱；但把「沉没成本+路径依赖+内卷+产业后备军」连成网络，你就能看穿一个行业的完整陷阱设计。',
    quote: "You've got to have multiple models.",
    author: 'Charlie Munger',
  },
  {
    title: '造血的吃肉，看门的啃骨头',
    content:
      '任何行业的岗位都可以分为两类：造血型（直接创造新财富）和看门狗型（防止既有财富流失）。选择比努力重要，因为结构决定分配。',
    quote: 'You will get rich by giving society what it wants but does not yet know how to get.',
    author: 'Naval Ravikant',
  },
  {
    title: '要么造血，要么带着造血技能看门',
    content:
      '如果你暂时在看门狗岗位，关键是保留「造血技能」（销售、研发、内容创作、直接创造现金流的能力），而不是只看门技能。',
    quote: "The acceptance of one's negative experience is itself a positive experience.",
    author: 'Mark Manson',
  },
]

// --- 金句速查 ---

export const QUICK_QUOTES = [
  { text: '造血的吃肉，看门的啃骨头，骨头还是别人啃完的。', source: '看门狗经济学' },
  { text: '坏人作恶需要动机，系统作恶只需要KPI。', source: '卷零·认知地图' },
  {
    text: '平台上活着的，是它们想让你看的；平台上死了的，才是它们害怕你知道的。',
    source: '卷二·消失的信息',
  },
  { text: '单个词是子弹，概念网络才是火力网。', source: '卷零·认知地图' },
  { text: '37%的人觉得自己工作毫无意义——这不是你的错觉，这是系统性的。', source: 'David Graeber' },
  { text: '产业后备军就是资本家的人质库——不需要雇佣，只需要存在。', source: '马克思' },
  { text: '你以为在灵活就业，其实在给平台当数字佃农。', source: '卷三·平台资本主义' },
  { text: '及时止损，比坚持错误更需要勇气。', source: '卷四·沉没成本' },
  { text: '不要问一个行业有没有前途，先问它是造血的，还是看门的。', source: '看门狗经济学' },
  { text: '用知识网络替代组织网络，用概念抗体替代罢工权。', source: '附录' },
]

// --- 页面锚点 ---

export const CAREER_NAV_ITEMS = [
  { id: 'cognitive-map', label: '认知地图' },
  { id: 'watchdog-economics', label: '看门狗经济学' },
  { id: 'hematopoiesis', label: '造血指南' },
  { id: 'cognitive-biases', label: '认知偏差' },
  { id: 'ghost-talks', label: '鬼话拆解' },
  { id: 'detection-tool', label: '检测工具' },
  { id: 'synonyms', label: '同物异名' },
  { id: 'masters', label: '大师框架' },
  { id: 'quotes', label: '金句' },
]
