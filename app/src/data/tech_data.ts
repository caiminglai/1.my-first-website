// ============================================================
// 产业拆解模块 -- iPhone 17 Pro Max 全维度拆解
// 数据来源：《iPhone17_ProMax_全维度拆解手册》2026年5月
// 目的：让普通人看懂高科技产业，找到进入高附加值产业的路径
// ============================================================

export interface TechComponent {
  id: string
  name: string
  nameEn: string
  vendors: string
  margin: string
  starRating: number
  summary: string
  principle: string
  manufacturing: string[]
  painPoints: string[]
  domestic: string
  alternatives: string[]
  careerEntry: string
}

export interface ProfitLayer {
  level: string
  label: string
  color: string
  components: string[]
  grossMargin: string
  barrier: string
}

export const PROFIT_PYRAMID: ProfitLayer[] = [
  {
    level: '暴利层',
    label: '毛利率 > 70%',
    color: '#C0392B',
    components: ['A19 Pro芯片（苹果自研）', '高通基带+专利费', 'Taptic Engine（苹果独占）'],
    grossMargin: '> 70%',
    barrier: '技术壁垒极高，EUV禁运+专利垄断，5年内无解',
  },
  {
    level: '极高利润层',
    label: '毛利率 45-60%',
    color: '#E67E22',
    components: ['索尼摄像头CIS', '三星/LG OLED屏幕', '高通射频前端', 'TI电源管理'],
    grossMargin: '45-60%',
    barrier: '供应商话语权强，专利+工艺壁垒高',
  },
  {
    level: '中等利润层',
    label: '毛利率 20-35%',
    color: '#F39C12',
    components: ['内存/存储', 'VC散热', '钛合金中框', 'Face ID模组', '激光雷达'],
    grossMargin: '20-35%',
    barrier: '规模效应明显，良率+认证是关键',
  },
  {
    level: '低利润层',
    label: '毛利率 8-20%',
    color: '#27AE60',
    components: ['电池', '声学器件', 'PCB主板', 'SIM卡托/结构件', 'FPC/连接器/屏蔽罩'],
    grossMargin: '8-20%',
    barrier: '中国已主导，靠产能+自动化取胜',
  },
]

export const COMPONENTS: TechComponent[] = [
  {
    id: 't01',
    name: '摄像头模组',
    nameEn: 'Camera Module',
    vendors: 'SONY索尼（CIS）/ 大立光（镜头）/ 舜宇光学（模组）',
    margin: '极高利润层',
    starRating: 3,
    summary: '手机拍照的心脏。索尼CIS全球垄断，国产豪威差1-2代。',
    principle:
      '像人眼一样：镜头把光线聚焦到传感器上，传感器把光变成电信号。暗光时4个小像素合并成1个大像素，让更多光进来。',
    manufacturing: [
      '硅晶圆光刻（SONY日本工厂）',
      '像素阵列离子注入与栅极氧化',
      '彩色滤光片与微透镜贴合',
      '镜头组注塑成型（大立光）',
      '音圈马达绕线与磁体装配',
      '模组主动对准（AA制程，6轴调心）',
      '封装测试',
    ],
    painPoints: [
      '暗光噪点控制：需背照式BSI结构',
      '主动对准精度：光轴偏差需<3μm',
      '7P镜头组公差：微米级控制',
    ],
    domestic:
      '豪威科技OV50K已达5000万像素，但低光信噪比与索尼仍有1-2代差距。舜宇光学可承接模组组装。',
    alternatives: ['豪威OV50K', '三星ISOCELL HP3', '国产替代进度★★★☆☆'],
    careerEntry:
      '→ 光学工程师：学大立光的镜头设计，或进舜宇光学做模组组装工程师。需要光学/机械背景。',
  },
  {
    id: 't02',
    name: '激光雷达',
    nameEn: 'LiDAR Scanner',
    vendors: 'SONY索尼（dToF芯片）/ Lumentum（VCSEL激光器）/ 光宝科技（模组）',
    margin: '中等利润层',
    starRating: 3,
    summary:
      '像蝙蝠用超声波定位，但用红外激光。发射激光脉冲，计算光飞出去再弹回来的时间，就知道距离多远。',
    principle:
      '发射940nm红外激光脉冲，照射目标后反射回SPAD单光子雪崩二极管。TDC以皮秒级精度记录光子往返时间，计算距离。同时打出3万个光点，画出3D形状。',
    manufacturing: [
      'VCSEL外延片生长（MOCVD）',
      '谐振腔刻蚀与电极制备',
      'SPAD芯片CMOS工艺（SONY）',
      '扩散片DOE光刻（3万点阵列）',
      '接收端与发射端主动对准',
      '模组封装与标定',
    ],
    painPoints: [
      'SPAD暗计数率：需<100cps',
      '多路径干扰：激光打到玻璃多次反射',
      'VCSEL人眼安全：功率需<Class 1',
    ],
    domestic:
      '奥比中光、炬光科技已有dToF模组方案，SPAD集成度与索尼差距约2年。舜宇光学可承接模组组装。',
    alternatives: ['奥比中光Femto Bolt', '舜宇光学dToF模组', '纵慧芯光VCSEL', '国产替代进度★★★☆☆'],
    careerEntry: '→ 光电工程师：学光电/物理专业，进奥比中光或炬光科技做ToF模组开发。',
  },
  {
    id: 't03',
    name: 'A19 Pro芯片',
    nameEn: 'A19 Pro SoC',
    vendors: 'Apple苹果（设计）/ TSMC台积电（代工，N3P工艺）',
    margin: '暴利层',
    starRating: 1,
    summary: '手机的大脑。指甲盖大的硅片上刻出200多亿个晶体管。3nm制程全球只有台积电能造。',
    principle:
      '在硅片上刻出200多亿个开关（晶体管），开关越快越多，手机越聪明。专门有一块Neural Engine负责AI计算，35TOPS算力。',
    manufacturing: [
      '架构设计（Apple Cupertino）',
      'RTL代码编写与验证',
      '物理设计（布局布线，10+金属层）',
      '掩膜版制作（EUV光刻，TSMC台湾）',
      '晶圆制造（N3P工艺，300+道工序）',
      '测试与切割',
      '封装（InFO扇出型封装）',
    ],
    painPoints: [
      'EUV光刻机：全球仅ASML能造，中国被禁运',
      '3nm良率：约70-80%，一片晶圆切出约300颗好芯片',
      '热管理：功耗密度超过核反应堆',
      'EDA工具被美欧垄断（Synopsys/Cadence）',
    ],
    domestic:
      '中芯国际N+2（等效7nm）已量产，与TSMC 3nm差距约2.5代。EUV被禁运，国产光刻机仅达90nm。差距巨大，5年内无解。',
    alternatives: [
      '华为麒麟（中芯7nm，性能差3代）',
      'RISC-V（开源指令集，生态薄弱）',
      '国产替代进度★☆☆☆☆',
    ],
    careerEntry:
      '→ 芯片设计工程师：需要电子工程/微电子专业背景。国内有中芯国际、海思等。但先进制程受限于设备。',
  },
  {
    id: 't04',
    name: '内存 RAM',
    nameEn: 'LPDDR5X Memory',
    vendors: 'SK hynix海力士 / Micron美光 / Samsung三星',
    margin: '中等利润层',
    starRating: 2,
    summary: '手机的临时记事本。12GB容量，断电后数据消失。',
    principle:
      '用电容的"有电/没电"表示1和0。电容会漏电，每隔64ms必须刷新一次。LPDDR5X就是更省电、速度更快的版本。',
    manufacturing: [
      '硅晶圆光刻（1αnm，约14nm）',
      '电容深孔刻蚀（深宽比>100:1）',
      '高介电常数介质沉积',
      '晶体管与电容互联',
      '多层金属布线',
      '颗粒测试（筛选速度/功耗合格品）',
      '与逻辑芯片PoP封装',
    ],
    painPoints: [
      '电容深孔刻蚀：深宽比>100:1，孔壁稍有倾斜就报废',
      '电荷保持时间：需高介电常数材料延长',
      '刷新功耗：每64ms刷新一次',
    ],
    domestic:
      '长鑫存储已量产LPDDR5，但产能与良率受限。美国制裁导致先进制程设备无法进口，扩产困难。',
    alternatives: ['长鑫存储LPDDR5（19nm工艺）', '国产替代进度★★☆☆☆'],
    careerEntry: '→ 存储芯片工程师：长鑫存储、长江存储是主要去向。需要半导体/材料背景。',
  },
  {
    id: 't05',
    name: '存储 ROM',
    nameEn: '3D NAND Flash',
    vendors: 'KIOXIA铠侠 / Samsung三星 / SK hynix海力士',
    margin: '中等利润层',
    starRating: 3,
    summary: '手机的长期仓库，断电数据不丢。像盖高楼一样把存储单元一层层叠起来（236层）。',
    principle:
      '把存储单元从平铺改成垂直叠起来（236层）。每个单元存3bit（TLC），通过电荷捕获型闪存记录数据。',
    manufacturing: [
      '硅晶圆沉积（交替沉积氧化物与氮化物）',
      '高深宽比通道孔刻蚀（贯穿200+层）',
      '电荷捕获层沉积（SiN）',
      '金属栅极填充（钨）',
      '阵列切割与互连',
      '控制器芯片封装',
      '与DRAM PoP叠层封装',
    ],
    painPoints: [
      '高深宽比刻蚀：200多层上刻直径100nm的直孔',
      '层间应力：236层薄膜应力累积导致晶圆翘曲',
      '电荷泄漏：电子缓慢泄漏导致电压漂移',
    ],
    domestic:
      '长江存储Xtacking 3.0（232层NAND）技术已达国际一流，但被美国列入实体清单，设备与材料进口受阻。',
    alternatives: ['长江存储232层NAND（Xtacking 3.0）', '国产替代进度★★★☆☆'],
    careerEntry: '→ 闪存工程师：长江存储是主要去向。需要材料/半导体背景。',
  },
  {
    id: 't06',
    name: '射频芯片',
    nameEn: 'RF Front-End',
    vendors: 'Qualcomm高通（QTM系列）',
    margin: '极高利润层',
    starRating: 2,
    summary: '手机的对讲机。把数字信号变成无线电波发出去，把收到的无线电波变回数字信号。',
    principle:
      '5G频率高、速度快，但信号容易衰减。功率放大器把信号加强，调谐器匹配天线阻抗，减少信号反射。',
    manufacturing: [
      '化合物半导体晶圆（GaAs/GaN）',
      '外延生长与光刻',
      'PA/滤波器/开关芯片制造',
      '多芯片SiP封装',
      '天线阵列集成（AiP）',
      '模组测试与校准',
    ],
    painPoints: [
      '毫米波PA效率：仅20-30%，大量电能变热',
      'BAW滤波器垄断：博通/村田专利壁垒极高',
      '天线一致性：毫米波波长仅10mm，位置偏差1mm就错',
    ],
    domestic: '卓胜微、唯捷创芯可提供Sub-6GHz模组，但毫米波PA、BAW滤波器差距2-3代。',
    alternatives: ['卓胜微MMMB PA', '开元通信滤波器', '麦捷科技SAW', '国产替代进度★★☆☆☆'],
    careerEntry: '→ 射频工程师：卓胜微、唯捷创芯招聘射频IC设计工程师。需要微波/通信背景。',
  },
  {
    id: 't07',
    name: '基带芯片',
    nameEn: 'Baseband Modem',
    vendors: 'Qualcomm高通 X85',
    margin: '暴利层',
    starRating: 1,
    summary: '手机连移动网络的翻译官。没有它，手机就是块砖头。',
    principle:
      '把CPU说的话翻译成基站能听懂的语言，再把基站的话翻译回来。需同时处理数十种频段、协议栈与运营商认证。',
    manufacturing: [
      '架构设计（支持全球数百个频段组合）',
      'DSP数字信号处理器设计',
      '模拟前端（ADC/DAC）',
      '协议栈软件编写（数百万行代码）',
      '流片（TSMC 4nm/3nm）',
      '运营商认证（全球200+运营商，每家测试数月）',
    ],
    painPoints: [
      '频段兼容性：全球5G频段超过50个',
      '协议栈复杂度：5G NR协议文档数万页',
      '专利壁垒：高通持有大量CDMA/OFDM核心专利',
      '认证周期：1-2年',
    ],
    domestic:
      '紫光展锐T820/联发科M80仅支持Sub-6GHz，无毫米波能力。苹果自研C1也仅达Sub-6水平。差距巨大。',
    alternatives: [
      '紫光展锐（低端）',
      '联发科M80（中端）',
      '苹果C1（自研，不成熟）',
      '国产替代进度★☆☆☆☆',
    ],
    careerEntry: '→ 通信协议工程师：紫光展锐、联发科招聘。需要通信工程背景，协议栈是核心壁垒。',
  },
  {
    id: 't08',
    name: '电源管理芯片',
    nameEn: 'PMIC',
    vendors: 'Texas Instruments德州仪器 / STMicro意法半导体 / Apple自研',
    margin: '极高利润层',
    starRating: 3,
    summary: '手机的配电房。把电池的3.8V切成CPU需要的1V、屏幕需要的10V、摄像头需要的2.8V。',
    principle: '通过Buck降压/Boost升压变换器，实时调节供电电压。CPU忙时给电，闲时省电。',
    manufacturing: [
      '模拟电路设计（基准源、误差放大器）',
      '功率级设计（MOSFET开关、电感、电容）',
      '控制环路补偿',
      '数字逻辑设计（PMBus接口）',
      'BCD工艺流片',
      '封装（QFN/WLCSP）',
      '系统级测试',
    ],
    painPoints: [
      '负载瞬态响应：CPU从休眠到满载只需几微秒',
      '多相并联：数十安培电流，相间电流均衡极难',
      '噪声抑制：开关电源纹波会干扰射频信号',
    ],
    domestic:
      '圣邦股份、韦尔股份、矽力杰可供应中低端PMIC。多相Buck控制器、大电流DrMOS与TI/英飞凌差距1-2代。',
    alternatives: ['圣邦微SGM6603', '矽力杰SY8088', '杰华特', '国产替代进度★★★☆☆'],
    careerEntry: '→ 模拟IC工程师：圣邦微、杰华特招聘。需要模拟电路设计基础，入门门槛相对较低。',
  },
  {
    id: 't09',
    name: 'USB-C控制芯片',
    nameEn: 'USB-PD Controller',
    vendors: 'NXP恩智浦 / Apple自研',
    margin: '中等利润层',
    starRating: 4,
    summary: '充电口的管家。插进去先"握手"协商功率，然后开始充电或传数据。',
    principle: '通过CC线检测插入方向，协商供电角色（Source/Sink/DRP），支持PD 3.1快充协议最高35W。',
    manufacturing: [
      '协议栈开发（USB-PD 3.1状态机）',
      '模拟前端设计（CC线检测电路）',
      '高压功率管集成（20V/5A）',
      '数字逻辑（BMC编解码）',
      'BCD工艺流片',
      '封装',
      '兼容性测试（数百种充电器组合）',
    ],
    painPoints: [
      '协议兼容性：市面上充电器质量参差不齐',
      '高压集成：功率管需耐压60V以上',
      'Thunderbolt 4信号完整性：40Gbps，阻抗需严格匹配',
    ],
    domestic: '芯海科技、英集芯、南芯半导体已量产USB-PD 3.1控制器，功能覆盖完整。',
    alternatives: ['芯海科技CS32G020', '英集芯IP2723T', '南芯SC2151A', '国产替代进度★★★★☆'],
    careerEntry: '→ 芯片应用工程师：芯海科技、南芯半导体招聘。需了解USB协议，门槛适中。',
  },
  {
    id: 't10',
    name: '显示屏',
    nameEn: 'LTPO OLED Display',
    vendors: 'Samsung三星（35%）/ LG乐金显示（65%）/ BOE京东方（国行少量）',
    margin: '极高利润层',
    starRating: 4,
    summary: '无数个彩色小灯泡（像素）组成的画布。OLED每个灯泡自己发光，不需要背光。',
    principle:
      '有机材料涂层通电后自己发光。LTPO技术能让灯泡在显示静态画面时几乎不耗电（1Hz刷新）。双层串联更亮更耐用。',
    manufacturing: [
      '玻璃基板清洗',
      'TFT背板光刻（LTPS+IGZO）',
      '蒸镀有机材料（Canon Tokki蒸镀机）',
      '封装（薄膜封装TFE，阻挡水氧）',
      '偏光片贴合',
      '触控层集成',
      '模组切割与测试',
    ],
    painPoints: [
      '蒸镀精度：有机材料厚度仅几十纳米',
      '蓝色寿命：蓝色OLED材料寿命最短（约2万小时）',
      '低频闪烁：1Hz刷新时人眼对亮度波动敏感',
      'Tandem成本：两层发光层+双层封装，良率降低',
    ],
    domestic:
      '京东方已量产LTPO+Tandem OLED，但良率70-75%低于三星85%+。蒸镀机仍依赖日本Canon Tokki。',
    alternatives: ['京东方（国行已供货LTPO）', 'TCL华星', '维信诺', '国产替代进度★★★★☆'],
    careerEntry: '→ 面板工艺工程师：京东方、TCL华星招聘。需要材料/化工背景，大专起步即可。',
  },
  {
    id: 't11',
    name: '听筒（受话器）',
    nameEn: 'Receiver',
    vendors: 'AAC Technologies瑞声科技',
    margin: '低利润层',
    starRating: 5,
    summary: '微型喇叭。电线圈在磁铁里通电就会动，带动塑料片振动发出声音。',
    principle: '洛伦兹力驱动音圈在永磁体磁场中振动，带动PET振膜发声。集成ePTFE防水透气膜。',
    manufacturing: [
      '磁体加工（NdFeB烧结、充磁）',
      '音圈绕线（铜线直径约0.03mm）',
      '振膜注塑（PET/PEI薄膜热压）',
      '磁路组装',
      '后腔与导音管装配',
      '防水膜贴合',
      '声学测试',
    ],
    painPoints: [
      '微型化极限：尺寸仅约5×3×2mm',
      'THD控制：总谐波失真需<5%',
      '防水一致性：ePTFE膜贴合不能有气泡',
    ],
    domestic: '完全自主。瑞声科技已是全球微型声学器件龙头，中国占全球产能80%+。',
    alternatives: ['瑞声科技（已是主供）', '歌尔股份', '国产替代进度★★★★★'],
    careerEntry:
      '→ 声学工程师/产线技术员：瑞声科技、歌尔股份大量招聘。声学、机械、电子专业均可，产线技术员高中/中专起步。',
  },
  {
    id: 't12',
    name: '扬声器',
    nameEn: 'Speaker',
    vendors: 'AAC瑞声科技 / Goertek歌尔股份',
    margin: '低利润层',
    starRating: 5,
    summary: '底部主喇叭+顶部听筒组成立体声。用算法欺骗耳朵，让小喇叭听起来低音更重。',
    principle: "金属振膜提升刚性减少分割振动。通过N'BASS虚拟低音增强算法扩展低频响应。",
    manufacturing: ['同听筒工艺（振膜更大）', '立体声配对校准'],
    painPoints: [
      '低频不足：手机腔体仅1-2cc，物理上无法发出<200Hz低音',
      '立体声一致性：左右扬声器频响偏差需<±1dB',
    ],
    domestic: '完全自主。中国厂商已垄断全球手机扬声器供应。',
    alternatives: ['已是国产主导', '国产替代进度★★★★★'],
    careerEntry: '→ 同听筒。瑞声科技、歌尔股份持续扩产，需求量极大。',
  },
  {
    id: 't13',
    name: '电池',
    nameEn: 'Li-ion Battery',
    vendors: 'SUNWODA欣旺达 / Desay德赛电池 / ATL新能源',
    margin: '低利润层',
    starRating: 5,
    summary: '装电的罐子。锂离子在正负极之间来回跑。硅碳负极能装更多电。',
    principle:
      '锂离子在正负极之间嵌入/脱出。硅碳负极理论容量是石墨的10倍，但充放电时体积膨胀300%，需做成纳米颗粒并包覆碳层。',
    manufacturing: [
      '正极材料制备（NCM或LCO）',
      '负极材料制备（纳米硅+石墨+硬碳）',
      '浆料涂布（铜箔/铝箔上涂正负极浆料）',
      '辊压与分切',
      '卷绕或叠片（隔膜隔开正负极）',
      '注液与化成（首次充电形成SEI膜）',
      '封装（铝塑膜软包）',
      'Pack组装（保护板+BMS电池管理系统）',
    ],
    painPoints: [
      '硅膨胀：即使纳米化+碳包覆，长期循环仍会粉化',
      'SEI稳定性：硅膨胀撑破SEI，电解液持续消耗',
      '快充发热：35W快充时电流约9A，内阻发热数瓦',
      '安全：过充/短路/穿刺会导致热失控',
    ],
    domestic:
      '完全自主。中国已主导全球锂电供应链。宁德时代/比亚迪/欣旺达均为苹果供应商。硅碳负极、隔膜、电解液均国产化。',
    alternatives: ['欣旺达（已是主供）', '德赛电池', 'ATL', '国产替代进度★★★★★'],
    careerEntry:
      '→ 电池工程师/产线技术员：欣旺达、宁德时代大量招聘。化学/材料专业优先，产线技术员高中起步即可。这是最容易进入的领域之一。',
  },
  {
    id: 't14',
    name: 'Taptic Engine',
    nameEn: 'Haptic Motor',
    vendors: 'Apple苹果自研自产（独占）',
    margin: '暴利层',
    starRating: 3,
    summary: '高级震动马达。像打桩机一样直线敲击，模拟"轻点"、"按压"、"滑动"等不同手感。苹果独占。',
    principle:
      '洛伦兹力驱动钨合金质量块在弹簧-阻尼系统中往复运动。通过精确控制驱动波形模拟不同触感。',
    manufacturing: [
      '磁路设计（永磁体+导磁轭铁）',
      '音圈绕线',
      '弹簧片激光切割（铍铜或不锈钢，厚约0.1mm）',
      '质量块加工（钨合金粉末冶金）',
      '磁路-线圈-质量块-弹簧组装',
      '驱动IC集成',
      '波形校准（每台设备测试固有频率）',
    ],
    painPoints: [
      '固有频率一致性：弹簧片厚度误差1μm导致频率偏移数Hz',
      '磁体退磁：钕铁硼在高温下退磁',
      '功耗：瞬时电流可达1A',
      '苹果独占：不对外销售',
    ],
    domestic: '不可行（苹果体系内）。瑞声科技、金龙机电可生产替代方案，但波形精度和功耗差距明显。',
    alternatives: ['瑞声科技（安卓替代）', '金龙机电', '国产替代进度★★★☆☆（苹果体系内不可替代）'],
    careerEntry: '→ 马达驱动工程师：瑞声科技招聘。需要机电一体化背景。',
  },
  {
    id: 't15',
    name: 'Face ID模组',
    nameEn: 'Face ID Module',
    vendors: 'LG Innotek乐金创新（模组）/ SONY索尼（红外CIS）/ Lumentum（VCSEL）',
    margin: '中等利润层',
    starRating: 3,
    summary: '用红外光照你的脸，打出3万个看不见的光点，算出你鼻子多高、眼窝多深，生成3D人脸地图。',
    principle:
      '结构光3D Sensing。点阵投影器发射约30000个940nm红外光点，红外摄像头捕捉面部光斑变形图案，通过三角测量法计算深度。',
    manufacturing: [
      'VCSEL外延片生长（MOCVD）',
      'DOE光刻（石英玻璃上刻衍射图案）',
      '红外CIS制造（SONY）',
      '泛光LED封装',
      '发射端与接收端主动对准（AA制程，6轴）',
      '模组封装',
      '标定（每台设备投射图案与接收图像的映射关系）',
    ],
    painPoints: [
      '基线限制：光源与摄像头距离仅约20mm',
      '多路径干扰：红外光在眼镜/镜面多次反射',
      '活体检测：需区分真脸与照片/面具/视频',
    ],
    domestic:
      '奥比中光、舜宇光学可提供结构光模组。红外CIS依赖索尼。DOE衍射光学元件国内水晶光电可供应。',
    alternatives: ['奥比中光Astra系列', '舜宇光学结构光模组', '水晶光电DOE', '国产替代进度★★★☆☆'],
    careerEntry: '→ 3D视觉工程师：奥比中光、舜宇光学招聘。光学/计算机视觉专业优先。',
  },
  {
    id: 't16',
    name: '主板（PCB）',
    nameEn: 'Main Board PCB',
    vendors: 'Apple苹果（设计）/ 鹏鼎控股 / 东山精密（PCB制造）',
    margin: '低利润层',
    starRating: 5,
    summary: '手机的骨架和血管。所有芯片焊在上面，密密麻麻的铜线把信号送到该去的地方。',
    principle:
      '高密度互连HDI PCB，采用Anylayer任意层互连技术，线宽/线距<30μm。10层以上堆叠，像千层饼一样。',
    manufacturing: [
      '基材裁切（FR-4或改性环氧树脂）',
      '内层图形（光刻蚀刻）',
      '层压（多层叠加，高温高压）',
      '激光钻孔（CO₂/UV激光，孔径50-100μm）',
      '化学铜+电镀铜（填孔）',
      '外层mSAP图形',
      '阻焊与表面处理',
      '电测（飞针测试）',
      'SMT贴片（焊接芯片）',
    ],
    painPoints: [
      '线宽精度：25μm线路，对准误差需<3μm',
      '层间对准：10层板总偏差需<5μm',
      '电镀填孔：激光孔需无空洞填铜',
      '高速信号完整性：数据速率>6400Mbps',
    ],
    domestic:
      '完全自主。鹏鼎控股（全球PCB龙头）、东山精密、深南电路均可制造任意层HDI与SLP。中国占全球高端PCB产能60%+。',
    alternatives: ['鹏鼎控股（已是主供）', '东山精密', '深南电路', '国产替代进度★★★★★'],
    careerEntry:
      '→ PCB工程师/产线技术员：鹏鼎控股、深南电路大量招聘。电子信息/化学专业优先，产线技术员中专起步。入门门槛最低的芯片相关职业之一。',
  },
  {
    id: 't17',
    name: '钛合金中框',
    nameEn: 'Titanium Frame',
    vendors: '宝钛股份/西部超导（材料）/ 富士康/BYD电子（CNC加工）',
    margin: '中等利润层',
    starRating: 5,
    summary: '手机的外壳骨架。钛合金（飞机也用）又轻又硬，但很难加工，切削时发烫严重。',
    principle:
      'TC4钛合金强度900MPa（不锈钢仅520MPa），密度4.43g/cm³（不锈钢的60%）。CNC精密铣削40+道工序，单件4-6小时。',
    manufacturing: [
      '钛锭熔炼（真空自耗电弧炉）',
      '锻造开坯（热轧成棒材）',
      'CNC粗铣（去除大部分余量）',
      'CNC精铣（外形、按键孔、摄像头孔，40+道工序）',
      '喷砂（粗化表面，去刀纹）',
      'PVD镀膜（TiN或DLC，真空腔体溅射）',
      '检测（三坐标测量，尺寸公差<±0.05mm）',
    ],
    painPoints: [
      '加工效率低：单件4-6小时，铝合金仅需30分钟',
      '表面质量：钛合金易与刀具粘结',
      '成本：钛合金原料$30/kg，铝合金仅$3/kg',
      'PVD膜附着力：边缘易磨损露底',
    ],
    domestic:
      '完全自主。宝钛股份、西部超导可提供航空级钛合金棒材。中国钛材产量占全球60%，CNC加工能力完备。',
    alternatives: [
      '宝钛股份（材料）',
      '西部超导（材料）',
      '比亚迪电子（加工）',
      '国产替代进度★★★★★',
    ],
    careerEntry:
      '→ CNC编程/操作工程师：比亚迪电子、长盈精密招聘。数控/机械专业优先，技工学校培训后可直接上岗。入门门槛极低！',
  },
  {
    id: 't18',
    name: '散热系统（VC均热板）',
    nameEn: 'Vapor Chamber',
    vendors: '双鸿Auras / 奇鋐Forcecon / 中石科技',
    margin: '中等利润层',
    starRating: 5,
    summary:
      '手机里的"热管空调"。芯片发热把水烧开变成蒸汽，蒸汽跑到冷端变回水，靠水变来变去把热带走。',
    principle:
      '真空腔内部充注去离子水。芯片发热使水蒸发，蒸汽以声速扩散至整个腔体，在冷端冷凝回流。内壁烧结铜粉形成毛细芯，依靠毛细力回流。',
    manufacturing: [
      '铜板冲压（上下盖，厚0.2-0.4mm）',
      '烧结铜粉（下盖内壁铺铜粉，氢气炉烧结）',
      '支撑柱焊接',
      '激光焊接（密封上下盖）',
      '抽真空与注液',
      '二次焊接封口',
      '压扁成型（厚度压至0.3-0.4mm）',
      '性能测试',
    ],
    painPoints: [
      '超薄化：厚度需<0.4mm',
      '气密性：漏率需<10⁻⁹ Pa·m³/s',
      '充液精度：误差需<5%',
      '方向无关性：手机旋转时仍需工作',
    ],
    domestic:
      '完全自主。双鸿（全球VC龙头）、奇鋐、中石科技均可量产超薄VC。中国占全球手机VC散热供应80%+。',
    alternatives: ['双鸿Auras（全球VC龙头）', '中石科技', '飞荣达', '国产替代进度★★★★★'],
    careerEntry: '→ 热设计工程师：双鸿、飞荣达招聘。需要机械/热能背景，门槛适中。',
  },
  {
    id: 't19',
    name: 'SIM卡托',
    nameEn: 'SIM Tray',
    vendors: 'Luxshare-ICT立讯精密',
    margin: '低利润层',
    starRating: 5,
    summary: '插SIM卡的小抽屉。MIM金属注射成型，精度极高，周围一圈橡胶圈防水。',
    principle:
      '不锈钢316L精密冲压+MIM金属注射成型。集成液态硅胶防水圈，压缩率25-30%，实现IP68防水。',
    manufacturing: [
      '不锈钢带材冲压（外形、卡槽）',
      'MIM成型（卡扣、复杂结构）',
      '去毛刺与抛光',
      'LSR防水圈注塑',
      'EMI弹片铆接',
      'PVD或电镀',
      '全尺寸检测（CCD视觉）',
      '插拔力测试',
    ],
    painPoints: [
      '尺寸精度：厚度仅约0.5mm，偏差>0.1mm卡插不进',
      'LSR粘接：硅胶与金属粘接需底涂剂',
      '插拔寿命：需通过5000次插拔测试',
    ],
    domestic:
      '完全自主。立讯精密、长盈精密、比亚迪电子垄断全球手机精密结构件。MIM工艺中国产能占全球70%。',
    alternatives: ['立讯精密（已是主供）', '长盈精密', '比亚迪电子', '国产替代进度★★★★★'],
    careerEntry:
      '→ 结构件工程师/MIM技术员：立讯精密大量招聘。机械/模具专业优先，产线技术员高中起步。',
  },
  {
    id: 't20',
    name: '其他小部件',
    nameEn: 'Other Components',
    vendors: '鹏鼎控股/东山精密（FPC）/ 立讯精密/安费诺（连接器）/ 领益智造（屏蔽罩）',
    margin: '低利润层',
    starRating: 5,
    summary:
      '柔性电路板（能弯的电线）、连接器（插头插座）、屏蔽罩（防信号干扰的金属盖子）、防水透气阀。',
    principle:
      'FPC柔性电路板用聚酰亚胺基材+铜箔，可弯折。BTB连接器间距0.35mm。屏蔽罩用洋白铜冲压，电磁屏蔽效能>80dB。',
    manufacturing: [
      'FPC：PI薄膜涂胶→覆铜→光刻→蚀刻→覆盖膜贴合',
      '连接器：铜合金冲压→注塑→电镀→自动装配',
      '屏蔽罩：洋白铜带材冲压→折弯',
      '防水阀：ePTFE膜裁切→与塑料支架热压贴合',
    ],
    painPoints: [
      'FPC细线路：线宽/距<25μm',
      '连接器插拔力：太紧易损坏焊盘，太松接触不良',
      'ePTFE一致性：膜厚度仅20-50μm，针孔即防水失效',
    ],
    domestic:
      '完全自主。FPC、连接器、屏蔽罩中国均占主导。仅极少数特种材料（如杜邦LCP天线基材）依赖进口。',
    alternatives: ['中国供应链已全面覆盖', '国产替代进度★★★★★'],
    careerEntry: '→ FPC工程师/连接器工程师：鹏鼎控股、立讯精密大量招聘。电子信息/材料专业均可。',
  },
]

export const DOMESTIC_ASSESSMENT = [
  {
    dimension: '完全主导',
    stars: 5,
    components: '电池、声学、PCB、散热、结构件、组装',
    desc: '占物料成本约55%，无技术瓶颈',
  },
  {
    dimension: '接近突破',
    stars: 4,
    components: '屏幕、USB-PD芯片',
    desc: '技术达标，良率/认证待提升',
  },
  {
    dimension: '差距明显',
    stars: 3,
    components: '摄像头CIS、LiDAR、Face ID、VC散热、电源管理',
    desc: '中低端可用，高端差1-2代',
  },
  {
    dimension: '制裁受限',
    stars: 2,
    components: '内存、存储',
    desc: '技术已达国际一流，但实体清单阻断苹果供应链',
  },
  {
    dimension: '差距巨大',
    stars: 1,
    components: 'A19 Pro芯片、高通基带、毫米波射频前端',
    desc: 'EUV禁运+专利壁垒，5年内无解',
  },
]

export const CORE_CONCLUSIONS = [
  {
    title: '中国能造一部iPhone 17 Pro Max吗？',
    answer: '能造80%价值的部件，但缺失20%核心利润部件',
    details:
      '能自主：电池、屏幕（京东方版）、声学、结构件、PCB、散热、组装 — 合计约占物料成本55%。不能自主：A19 Pro芯片（需台积电3nm）、基带（需高通）、主摄CIS（索尼）— 合计约占物料成本35%，也是利润最高的部分。',
  },
  {
    title: '利润去哪了？',
    answer: '暴利层被芯片设计+专利费拿走，中国主导的是低利润层',
    details:
      '苹果自研A19 Pro毛利率>70%，高通基带每部收$7-10专利费+$30-40芯片费。而中国主导的电池、声学、PCB、组装等，毛利率仅8-20%。',
  },
  {
    title: '普通人的机会在哪？',
    answer: '从"低利润层"切入，向"中等利润层"攀升',
    details:
      '低利润层（★★★★★）产能大、需求稳、入门门槛低：CNC操作、电池产线、PCB技术员、声学测试。中等利润层（★★★☆☆）有技术溢价：VC散热设计、电源管理IC、摄像头模组组装。不要一上来就追芯片设计（差距5年），先在能赢的地方站稳脚跟。',
  },
]

export interface CareerPath {
  level: string
  label: string
  color: string
  entryBarrier: string
  education: string
  examples: string[]
  salaryRange: string
}

export const CAREER_PATHS: CareerPath[] = [
  {
    level: '零门槛入行',
    label: '产线技术员/操作工',
    color: '#27AE60',
    entryBarrier: '高中/中专即可',
    education: '技工学校培训1-3个月',
    examples: [
      '电池产线技术员（欣旺达）',
      'CNC操作工（比亚迪电子）',
      'PCB飞针测试员（鹏鼎控股）',
      '声学器件组装（瑞声科技）',
      '结构件质检（立讯精密）',
    ],
    salaryRange: '5K-8K/月（起步）',
  },
  {
    level: '低门槛技术岗',
    label: '工艺/设备工程师',
    color: '#F39C12',
    entryBarrier: '大专/本科',
    education: '机械/电子/材料/化工专业',
    examples: [
      'CNC编程工程师',
      'PCB工艺工程师',
      '散热设计工程师',
      '电池BMS工程师',
      'MIM工艺工程师',
    ],
    salaryRange: '8K-15K/月',
  },
  {
    level: '中门槛研发岗',
    label: 'IC设计/算法工程师',
    color: '#E67E22',
    entryBarrier: '本科/硕士',
    education: '微电子/通信/计算机专业',
    examples: [
      '模拟IC工程师（圣邦微）',
      '射频IC工程师（卓胜微）',
      'USB-PD芯片工程师（南芯半导体）',
      '3D视觉算法工程师（奥比中光）',
    ],
    salaryRange: '15K-30K/月',
  },
  {
    level: '高门槛核心岗',
    label: '芯片架构/协议栈工程师',
    color: '#C0392B',
    entryBarrier: '硕士/博士',
    education: '微电子/通信/物理专业',
    examples: [
      '先进制程工艺工程师（中芯国际）',
      '基带协议栈工程师（紫光展锐）',
      'ISP图像处理工程师（豪威科技）',
      'EDA工具开发（国内初创）',
    ],
    salaryRange: '30K-60K/月',
  },
]

export const TECH_NAV_ITEMS = [
  { id: 'profit-pyramid', label: '利润金字塔' },
  { id: 'components', label: '20部件拆解' },
  { id: 'domestic', label: '国产替代' },
  { id: 'conclusions', label: '核心结论' },
  { id: 'career-paths', label: '职业路径' },
]
