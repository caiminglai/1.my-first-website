export interface HighPayJob {
  id: string
  category: string
  title: string
  companies: string[]
  salary: string
  education: string
  duration: string
  definition: string
  stages: {
    stage: string
    title: string
    duration: string
    skills: { name: string; desc: string }[]
  }[]
  resources: { type: string; title: string; desc: string; link: string }[]
  project: string[]
}

export interface CategoryInfo {
  name: string
  icon: string
  jobs: string[]
}

export const CATEGORIES: CategoryInfo[] = [
  {
    name: '半导体/芯片类',
    icon: '🔧',
    jobs: [
      'analog-ic',
      'rf-ic',
      'pm-ic',
      'digital-ic',
      'process',
      'baseband',
      'npu-arch',
      'eda',
      'chip-verify',
      'packaging',
      'firmware',
    ],
  },
  {
    name: 'AI/算法类',
    icon: '🤖',
    jobs: ['ai-llm', 'cv-algo', 'nlp-algo', 'av', 'robot', 'audio-video', 'quant', 'bioinfo'],
  },
  {
    name: '软件/系统类',
    icon: '💻',
    jobs: [
      'cloud-sre',
      'db-kernel',
      'game-engine',
      'security',
      'blockchain',
      'industrial',
      'new-energy',
    ],
  },
]

export const HIGH_PAY_JOBS: HighPayJob[] = [
  {
    id: 'analog-ic',
    category: '半导体/芯片类',
    title: '模拟IC设计工程师',
    companies: ['圣邦微', '艾为电子', '思瑞浦', '纳芯微'],
    salary: '15K-30K',
    education: '本科/硕士',
    duration: '6-12个月入门',
    definition:
      '设计运放、LDO、ADC这些模拟电路芯片。模拟IC是芯片界的"老中医"——越老越值钱，因为经验无法被AI替代。',
    stages: [
      {
        stage: 'Stage 1',
        title: '筑基期',
        duration: '1-3个月',
        skills: [
          {
            name: 'MOS管工作原理',
            desc: 'PN结怎么导电、阈值电压是什么、饱和区/线性区区别。这是所有模拟IC的开关。',
          },
          {
            name: '单级放大器',
            desc: '共源级、共栅级、共漏级。三种接法的增益、输入阻抗、输出阻抗怎么算。',
          },
          { name: '电流镜与偏置', desc: '怎么给电路提供稳定的"水龙头"，不受温度影响。' },
          {
            name: 'Cadence Virtuoso',
            desc: '画原理图、跑仿真、看波形。工具不会用，设计无从谈起。',
          },
        ],
      },
      {
        stage: 'Stage 2',
        title: '实战期',
        duration: '3-6个月',
        skills: [
          { name: '差分对设计', desc: '模拟IC的"乐高积木"。学怎么抵消噪声、提高共模抑制比。' },
          {
            name: '频率补偿与稳定性',
            desc: '相位裕度60度是什么意思？米勒补偿怎么加？电路震荡怎么修？',
          },
          {
            name: 'LDO完整设计',
            desc: '从误差放大器→功率管→反馈网络，带载能力、压差、静态电流怎么权衡。',
          },
          { name: '版图设计基础', desc: '匹配、寄生电容、闩锁效应保护。画完电路必须能画版图。' },
        ],
      },
      {
        stage: 'Stage 3',
        title: '进阶期',
        duration: '6-12个月',
        skills: [
          {
            name: 'Bandgap基准源',
            desc: '产生与温度无关的电压，芯片的"尺子"。CTAT+PTAT补偿原理。',
          },
          {
            name: '噪声分析',
            desc: '热噪声、1/f闪烁噪声。算等效输入噪声，知道怎么通过增大面积换噪声。',
          },
          { name: 'ADC/DAC架构', desc: 'SAR ADC、Sigma-Delta、Pipeline各自适合什么场景。' },
          {
            name: 'Spec解读与系统权衡',
            desc: '看懂datasheet里的指标，知道增益、带宽、功耗、噪声怎么trade-off。',
          },
        ],
      },
    ],
    resources: [
      {
        type: '教材',
        title: '《模拟CMOS集成电路设计》（拉扎维）',
        desc: '模拟IC圣经，第2章单级放大器、第4章差分对必须手推公式。',
        link: 'https://book.douban.com/subject/30220292/',
      },
      {
        type: '视频课',
        title: '拉扎维模拟IC设计（台大）',
        desc: 'B站有完整搬运，配合书一起看效果最好。',
        link: 'https://www.bilibili.com/video/BV1FE411n7Z3',
      },
      {
        type: '工具教程',
        title: 'Cadence Virtuoso入门实战',
        desc: 'CSDN/B站搜"Virtuoso教程"，跟着画一个反相器全流程。',
        link: 'https://www.bilibili.com/video/BV1S54y1G7B2',
      },
      {
        type: '开源项目',
        title: 'SkyWater PDK + OpenROAD',
        desc: '免费的开源工艺库，130nm足够学原理。',
        link: 'https://github.com/google/skywater-pdk',
      },
    ],
    project: [
      '用Cadence新建工程，选SkyWater 130nm工艺',
      '设计误差放大器：差分对输入+共源级输出',
      '加功率管（PMOS），算宽长比满足负载电流100mA',
      '画反馈电阻网络，确定输出电压',
      '跑DC仿真：看输出电压、静态电流、压差',
      '跑AC仿真：加米勒电容，调相位裕度到60度以上',
      '画版图：注意匹配、大电流走线宽度、ESD保护',
      '跑后仿真，对比前后仿真差异',
      '整理成报告：指标表格+仿真截图+版图照片',
    ],
  },
  {
    id: 'rf-ic',
    category: '半导体/芯片类',
    title: '射频IC工程师',
    companies: ['卓胜微', '唯捷创芯', '慧智微', '康希通信'],
    salary: '15K-30K',
    education: '本科/硕士',
    duration: '8-14个月入门',
    definition:
      '设计手机WiFi/蓝牙/5G射频前端芯片（LNA、PA、Switch）。射频是"黑魔法"——同样的电路图，Layout差1毫米性能天差地别。',
    stages: [
      {
        stage: 'Stage 1',
        title: '筑基期',
        duration: '2-4个月',
        skills: [
          {
            name: '传输线与阻抗',
            desc: '什么是特性阻抗50欧姆？反射系数、驻波比VSWR。高频下导线不是导线，是传输线。',
          },
          {
            name: '史密斯圆图',
            desc: '射频人的"计算器"。阻抗匹配、容性/感性怎么在圆图上转，必须徒手能画。',
          },
          { name: 'S参数基础', desc: 'S11回波损耗、S21增益、S12隔离度。网络分析仪测的就是这个。' },
          {
            name: 'ADS基础操作',
            desc: 'Keysight ADS是射频仿真行业标准。会建原理图、跑S参数仿真、调匹配网络。',
          },
        ],
      },
      {
        stage: 'Stage 2',
        title: '实战期',
        duration: '4-8个月',
        skills: [
          {
            name: 'LNA低噪声放大器',
            desc: '噪声系数NF、增益、线性度IIP3。共源共栅结构为什么能隔离Miller效应。',
          },
          {
            name: 'PA功率放大器',
            desc: 'Class A/B/AB/D/E的区别。效率（PAE）和线性度（ACLR）的trade-off。',
          },
          { name: 'Mixer与VCO', desc: '混频器怎么把射频变中频。VCO的相位噪声、调谐范围、Kvco。' },
          { name: '阻抗匹配网络设计', desc: 'L型、π型、T型匹配。用ADS优化，把S11压到-10dB以下。' },
        ],
      },
      {
        stage: 'Stage 3',
        title: '进阶期',
        duration: '8-14个月',
        skills: [
          {
            name: 'PLL锁相环',
            desc: '锁相环架构：PFD→CP→LPF→VCO→Divider。相位噪声、锁定时间、杂散怎么优化。',
          },
          {
            name: '射频版图与寄生',
            desc: '高频走线、接地过孔、屏蔽环、差分对称。寄生电感电容可能毁掉你的设计。',
          },
          {
            name: '射频测试与校准',
            desc: '懂网络分析仪、频谱仪、综测仪。知道怎么debug：是匹配问题还是稳定性问题？',
          },
          {
            name: '通信标准基础',
            desc: 'WiFi 6/7、蓝牙、5G NR的频段、带宽、调制方式。知道你的芯片要满足什么标准。',
          },
        ],
      },
    ],
    resources: [
      {
        type: '教材',
        title: '《射频集成电路与系统》（李智群）',
        desc: '国内射频IC最实用教材，从传输线讲到PLL。',
        link: 'https://book.douban.com/subject/34839901/',
      },
      {
        type: '教材',
        title: '《RF Microelectronics》（Razavi）',
        desc: '拉扎维的射频书，第2章Mixer、第4章LNA、第8章PLL是面试重灾区。',
        link: 'https://book.douban.com/subject/26366040/',
      },
      {
        type: '视频课',
        title: '射频电路设计（东南大学）',
        desc: 'B站有完整课程，从Smith Chart讲起，适合零基础。',
        link: 'https://www.bilibili.com/video/BV1bt411G7aF',
      },
      {
        type: '工具教程',
        title: 'ADS射频仿真入门',
        desc: 'Keysight官网有免费学生版，B站搜"ADS仿真教程"跟着做LNA。',
        link: 'https://www.bilibili.com/video/BV1S54y1G7B2',
      },
    ],
    project: [
      '用ADS新建工程，选工艺库（如TSMC 65nm RF）',
      '确定指标：NF<2dB，Gain>15dB，IIP3>-5dBm，S11<-10dB',
      '选晶体管：查fT/fmax，确保2.4GHz下还能提供增益',
      '设计共源共栅（Cascode）结构，手算偏置点和增益',
      '用Smith Chart做输入匹配：把50欧姆转到晶体管最佳噪声源阻抗',
      'ADS仿真：跑S参数、噪声系数、P1dB压缩点、IIP3',
      '优化：调匹配网络，让S11和NF同时达标',
      '画版图：注意射频走线50欧姆微带线、接地过孔阵列、屏蔽',
      '后仿真对比：看寄生参数对S21和NF的影响',
      '整理报告：指标表格+Smith Chart截图+版图+前后仿真对比',
    ],
  },
  {
    id: 'pm-ic',
    category: '半导体/芯片类',
    title: '电源管理IC工程师',
    companies: ['南芯半导体', '矽力杰', '杰华特', '希荻微'],
    salary: '15K-30K',
    education: '本科/硕士',
    duration: '5-10个月入门',
    definition:
      '设计快充芯片、Buck/Boost变换器、LDO、电荷泵。手机续航和充电速度全指望你。这个方向门槛相对友好，国产替代需求极大。',
    stages: [
      {
        stage: 'Stage 1',
        title: '筑基期',
        duration: '1-2个月',
        skills: [
          {
            name: 'Buck降压拓扑',
            desc: '开关管+电感+二极管/同步管+电容。CCM/DCM模式，占空比D=Vout/Vin。',
          },
          {
            name: 'Boost升压拓扑',
            desc: '电感储能→开关释放→电容滤波。占空比D=1-Vin/Vout，注意右半平面零点。',
          },
          {
            name: 'Buck-Boost / 电荷泵',
            desc: '负压怎么产生？电荷泵用飞电容切换，适合小电流场景。',
          },
          {
            name: '电感电容选型计算',
            desc: '纹波电流、输出纹波电压、ESR影响。不是越大越好，要算。',
          },
        ],
      },
      {
        stage: 'Stage 2',
        title: '实战期',
        duration: '3-6个月',
        skills: [
          {
            name: 'PWM控制模式',
            desc: '电压模式 vs 电流模式。电流模式抗干扰强，但需要斜坡补偿防次谐波震荡。',
          },
          {
            name: '环路补偿设计',
            desc: 'Type II/III补偿器，波特图，相位裕度>45度。电源不稳，系统全崩。',
          },
          {
            name: '热设计与效率优化',
            desc: '导通损耗+开关损耗=总损耗。GaN/SiC为什么能提频降体积？算结温、懂散热。',
          },
          {
            name: 'USB-PD快充协议',
            desc: 'Type-C CC线通信、功率档位协商、PPS可调电压。协议状态机必须懂。',
          },
        ],
      },
      {
        stage: 'Stage 3',
        title: '进阶期',
        duration: '6-10个月',
        skills: [
          {
            name: '片上功率管设计',
            desc: '怎么在芯片里集成大电流MOS管？版图技巧：finger结构、金属层走电流。',
          },
          {
            name: '软启动/过流/过温保护',
            desc: '电源芯片的"保险丝"。怎么检测电流？怎么实现打嗝模式？',
          },
          { name: 'GaN/SiC应用', desc: '第三代半导体特性：高频、高效、耐高温。但驱动电路更复杂。' },
          { name: '系统级EMI/EMC', desc: '开关电源是EMI干扰源。布局怎么减少辐射？Y电容怎么加？' },
        ],
      },
    ],
    resources: [
      {
        type: '教材',
        title: '《开关电源设计》（Sanjaya Maniktala）',
        desc: '开关电源圣经，从环路稳定性到PCB布局全讲透。',
        link: 'https://book.douban.com/subject/10476726/',
      },
      {
        type: '视频课',
        title: '开关电源设计精讲（B站）',
        desc: '硬件工程师"老木匠"的系列视频，实战经验丰富。',
        link: 'https://www.bilibili.com/video/BV1Z4411i79Q',
      },
      {
        type: '工具教程',
        title: 'PSpice/TI TINA仿真入门',
        desc: 'TI官网有免费仿真软件，自带电源管理库。',
        link: 'https://www.ti.com/tool/TINA-TI',
      },
      {
        type: '开源项目',
        title: 'RISC-V电源管理IP',
        desc: '开源电源管理控制器，可学习数字控制部分。',
        link: 'https://github.com/openhwgroup/cva6',
      },
    ],
    project: [
      '用LTspice/TINA建一个5V转1.8V Buck电路',
      '确定指标：输出电流2A，纹波<50mV，效率>90%',
      '选型：MOS管IRLR2905、电感Murata LQM2H',
      '设计Type II补偿器，画波特图验证相位裕度>50度',
      '搭硬件电路，用示波器测负载瞬态响应',
      '优化PCB布局：功率地、模拟地分开，电源环路最小化',
      '测试效率曲线，看轻载/重载效率',
      '编写测试报告，对比仿真与实测数据',
    ],
  },
  {
    id: 'digital-ic',
    category: '半导体/芯片类',
    title: '数字IC前端/验证工程师',
    companies: ['华为海思', '紫光展锐', '寒武纪', '地平线'],
    salary: '15K-30K',
    education: '本科/硕士',
    duration: '6-12个月入门',
    definition:
      '用Verilog/VHDL描述数字电路，再用UVM验证它是否正确。数字IC是芯片的"骨架"，CPU、GPU、NPU全靠它。',
    stages: [
      {
        stage: 'Stage 1',
        title: '筑基期',
        duration: '2-3个月',
        skills: [
          {
            name: 'Verilog语法',
            desc: '模块、端口、always块、assign语句。组合逻辑和时序逻辑的区别。',
          },
          {
            name: '时序分析基础',
            desc: '建立时间、保持时间、时钟偏斜。为什么setup/hold violation会导致电路出错。',
          },
          { name: '状态机设计', desc: 'Moore型vs Mealy型。怎么用三段式写状态机，避免综合问题。' },
          { name: 'FPGA验证平台', desc: '用FPGA快速验证设计。Vivado/ISE工具链，约束文件编写。' },
        ],
      },
      {
        stage: 'Stage 2',
        title: '实战期',
        duration: '4-6个月',
        skills: [
          {
            name: 'RTL设计实战',
            desc: '设计UART、SPI、I2C接口。AHB/AXI总线协议。FIFO、计数器、分频器。',
          },
          {
            name: 'UVM验证方法学',
            desc: '验证平台架构：Driver、Monitor、Scoreboard、Coverage。sequence和virtual sequence。',
          },
          {
            name: '形式验证',
            desc: '用SMT求解器证明设计的某些属性永远成立。等价性检查（Formal Equivalence Check）。',
          },
          { name: 'CDC跨时钟域', desc: '多时钟域设计。异步FIFO、握手信号、两级寄存器同步。' },
        ],
      },
      {
        stage: 'Stage 3',
        title: '进阶期',
        duration: '6-12个月',
        skills: [
          {
            name: '低功耗设计',
            desc: 'Clock Gating、Power Gating、Multi-Voltage Domain。UPF功耗约束。',
          },
          { name: 'DFT可测试性设计', desc: 'Scan Chain、MBIST、Boundary Scan。ATE测试原理。' },
          { name: 'SoC集成', desc: 'IP核集成、总线互联、时钟树综合。Floorplan规划原则。' },
          { name: 'ASIC实现流程', desc: '从RTL到GDSII：综合→Floorplan→CTS→Routing→Signoff。' },
        ],
      },
    ],
    resources: [
      {
        type: '教材',
        title: '《Verilog HDL设计实战》',
        desc: '从语法到实战，附带大量工程实例。',
        link: 'https://book.douban.com/subject/30220292/',
      },
      {
        type: '教材',
        title: '《芯片验证漫游指南》（刘斌）',
        desc: 'UVM验证的"圣经"，从入门到精通。',
        link: 'https://book.douban.com/subject/34839901/',
      },
      {
        type: '视频课',
        title: '数字IC设计入门（B站）',
        desc: '清华老师主讲，从Verilog到ASIC流程全讲。',
        link: 'https://www.bilibili.com/video/BV1Es41127HY',
      },
      {
        type: '开源项目',
        title: 'RISC-V Core（RV32I）',
        desc: '开源RISC-V核，可学习CPU设计原理。',
        link: 'https://github.com/riscv/riscv-coremark',
      },
    ],
    project: [
      '用Verilog设计一个UART控制器（波特率9600/115200可配置）',
      '写Testbench验证发送/接收功能',
      '用UVM搭建验证平台，覆盖所有功能点',
      '在FPGA上实现，用串口助手测试',
      '添加FIFO缓冲区，实现连续收发',
      '设计AXI-Lite接口，接入SoC系统',
      '写覆盖率报告，确保验证完备',
      '整理成项目文档，作为面试作品集',
    ],
  },
  {
    id: 'ai-llm',
    category: 'AI/算法类',
    title: '大模型算法工程师',
    companies: ['字节跳动', '阿里云', '腾讯', '商汤科技'],
    salary: '30K-70K',
    education: '硕士/博士',
    duration: '8-18个月入门',
    definition:
      '设计和优化大语言模型（LLM）。Transformer架构、预训练、微调、对齐。是当前AI最热门的方向，薪资天花板极高。',
    stages: [
      {
        stage: 'Stage 1',
        title: '筑基期',
        duration: '2-4个月',
        skills: [
          {
            name: 'Transformer架构',
            desc: 'Encoder-Decoder结构。自注意力机制、多头注意力、残差连接、Layer Normalization。',
          },
          {
            name: 'PyTorch/TensorFlow',
            desc: '熟练使用PyTorch。自定义Dataset、Dataloader、模型保存加载。',
          },
          {
            name: '数学基础',
            desc: 'Transformer里的矩阵运算。Softmax、LayerNorm、残差连接的梯度流动。',
          },
          {
            name: '预训练数据处理',
            desc: 'Tokenization、BPE编码、数据清洗、长文本截断/分段策略。',
          },
        ],
      },
      {
        stage: 'Stage 2',
        title: '实战期',
        duration: '4-8个月',
        skills: [
          {
            name: '从零实现GPT',
            desc: '用PyTorch实现一个简化版GPT。包括Embedding、Transformer Block、LM Head。',
          },
          {
            name: 'LoRA微调',
            desc: '低秩适配。怎么冻结大模型参数，只训练Adapter。QLoRA量化微调。',
          },
          { name: 'RLHF对齐', desc: '人类反馈强化学习。Reward Model训练、PPO算法。' },
          { name: '分布式训练', desc: 'PyTorch DDP、FSDP。数据并行、模型并行、流水线并行。' },
        ],
      },
      {
        stage: 'Stage 3',
        title: '进阶期',
        duration: '8-18个月',
        skills: [
          {
            name: '模型压缩',
            desc: '量化（INT8/INT4）、蒸馏、剪枝。HuggingFace PEFT、GPTQ、AWQ。',
          },
          {
            name: '推理优化',
            desc: 'FlashAttention、PagedAttention、vLLM/Triton Inference Server。',
          },
          {
            name: '长上下文',
            desc: '滑动窗口注意力、MQA/GQA、FlashAttention-2。100K+上下文长度。',
          },
          {
            name: 'MoE混合专家',
            desc: 'Switch Transformer、Mixtral。路由策略、负载均衡、通信优化。',
          },
        ],
      },
    ],
    resources: [
      {
        type: '论文',
        title: 'Attention is All You Need',
        desc: 'Transformer开山之作，必读。',
        link: 'https://arxiv.org/abs/1706.03762',
      },
      {
        type: '教材',
        title: '《深度学习》（花书）',
        desc: '深度学习基础，第12章序列建模必读。',
        link: 'https://book.douban.com/subject/27087503/',
      },
      {
        type: '视频课',
        title: '李沐Transformer教程',
        desc: '动手学深度学习系列，B站有完整视频。',
        link: 'https://www.bilibili.com/video/BV1pu411o7BE',
      },
      {
        type: '开源项目',
        title: 'GPT-NeoX/LLaMA',
        desc: '开源大模型，可拿来微调练手。',
        link: 'https://github.com/EleutherAI/gpt-neox',
      },
    ],
    project: [
      '用PyTorch实现一个小型GPT（12层，768维）',
      '在WikiText数据集上预训练',
      '用LoRA在Alpaca数据集上微调',
      '实现PPO微调，做RLHF对齐',
      '用GPTQ量化到4-bit',
      '部署到vLLM，测吞吐和延迟',
      '写一篇技术博客，记录整个流程',
      '整理成GitHub项目，作为面试作品集',
    ],
  },
  {
    id: 'cv-algo',
    category: 'AI/算法类',
    title: '计算机视觉算法工程师',
    companies: ['商汤科技', '旷视科技', '依图科技', '云从科技'],
    salary: '15K-35K',
    education: '本科/硕士',
    duration: '6-12个月入门',
    definition:
      '让计算机"看懂"图像和视频。目标检测、图像分类、语义分割、姿态估计。安防、自动驾驶、手机拍照都靠它。',
    stages: [
      {
        stage: 'Stage 1',
        title: '筑基期',
        duration: '2-3个月',
        skills: [
          {
            name: '图像处理基础',
            desc: 'OpenCV操作：滤波、边缘检测、形态学操作。直方图均衡化、图像变换。',
          },
          { name: 'CNN基础', desc: '卷积、池化、ReLU。LeNet、AlexNet、VGG结构。感受野计算。' },
          { name: 'PyTorch入门', desc: '搭建简单CNN、训练循环、数据增强。TensorBoard可视化。' },
          { name: '经典网络', desc: 'ResNet残差连接、DenseNet密集连接、MobileNet深度可分离卷积。' },
        ],
      },
      {
        stage: 'Stage 2',
        title: '实战期',
        duration: '4-6个月',
        skills: [
          {
            name: '目标检测',
            desc: 'YOLO系列（v5/v8）、Faster R-CNN、DETR。Anchor-based vs Anchor-free。',
          },
          { name: '语义分割', desc: 'U-Net、DeepLab、Mask R-CNN。编码器-解码器结构、注意力机制。' },
          { name: '关键点检测', desc: 'HRNet、Hourglass。热力图回归、OKS评估指标。' },
          { name: '模型部署', desc: 'ONNX转换、TensorRT优化、OpenVINO推理。量化、剪枝、蒸馏。' },
        ],
      },
      {
        stage: 'Stage 3',
        title: '进阶期',
        duration: '6-12个月',
        skills: [
          {
            name: 'Transformer在CV',
            desc: 'ViT视觉Transformer、Swin Transformer、MAE掩码自编码器。',
          },
          { name: '3D视觉', desc: '单目深度估计、点云处理、NeRF神经辐射场。' },
          { name: '视频理解', desc: 'TimeSformer、SlowFast、X3D。动作识别、时序建模。' },
          { name: '小样本/零样本学习', desc: 'Few-shot learning、Prompt learning、CLIP对比学习。' },
        ],
      },
    ],
    resources: [
      {
        type: '教材',
        title: '《计算机视觉：算法与应用》（Szeliski）',
        desc: 'CV领域的百科全书，数学推导严谨。',
        link: 'https://book.douban.com/subject/24733713/',
      },
      {
        type: '教材',
        title: '《深度学习与计算机视觉》',
        desc: '从基础到前沿，附带大量实战代码。',
        link: 'https://book.douban.com/subject/34839901/',
      },
      {
        type: '视频课',
        title: '李飞飞CS231n',
        desc: '斯坦福经典课程，B站有中英字幕。',
        link: 'https://www.bilibili.com/video/BV1Z4411i79Q',
      },
      {
        type: '开源项目',
        title: 'YOLOv8/PyTorchCV',
        desc: '最新YOLO版本，代码清晰，适合实战。',
        link: 'https://github.com/ultralytics/ultralytics',
      },
    ],
    project: [
      '用YOLOv8训练自己的目标检测模型',
      '准备数据集：标注1000张图片（VOC格式）',
      '训练：调参、数据增强、早停策略',
      '评估：mAP@0.5、FPS、模型大小',
      '部署：转ONNX，用TensorRT加速',
      '优化：量化到INT8，对比精度损失',
      '做一个简单的Demo：实时摄像头检测',
      '整理项目文档，放在GitHub',
    ],
  },
  {
    id: 'cloud-sre',
    category: '软件/系统类',
    title: '云计算/SRE工程师',
    companies: ['阿里云', '腾讯云', '华为云', '字节跳动'],
    salary: '15K-35K',
    education: '本科',
    duration: '4-8个月入门',
    definition:
      '保障大型分布式系统的稳定性和可靠性。监控告警、容量规划、故障排查、自动化运维。是互联网公司的核心岗位。',
    stages: [
      {
        stage: 'Stage 1',
        title: '筑基期',
        duration: '1-2个月',
        skills: [
          {
            name: 'Linux系统',
            desc: '熟练使用Linux命令行。文件系统、进程管理、网络配置、日志查看。',
          },
          { name: '网络基础', desc: 'TCP/IP协议、HTTP/HTTPS、DNS解析、负载均衡原理。' },
          { name: '脚本编程', desc: 'Shell脚本、Python自动化。sed/awk/grep文本处理。' },
          { name: '容器基础', desc: 'Docker原理、Dockerfile编写、镜像管理、Docker Compose。' },
        ],
      },
      {
        stage: 'Stage 2',
        title: '实战期',
        duration: '3-4个月',
        skills: [
          {
            name: 'Kubernetes',
            desc: 'Pod、Service、Deployment、StatefulSet。kubectl命令、YAML配置。',
          },
          { name: '监控告警', desc: 'Prometheus指标采集、Grafana可视化、Alertmanager告警。' },
          { name: 'CI/CD', desc: 'Jenkins、GitLab CI、GitHub Actions。Pipeline编写、自动化测试。' },
          { name: '故障排查', desc: '日志分析、性能分析（perf）、网络抓包（tcpdump/wireshark）。' },
        ],
      },
      {
        stage: 'Stage 3',
        title: '进阶期',
        duration: '4-8个月',
        skills: [
          { name: '分布式系统', desc: 'CAP理论、一致性协议（Raft/Paxos）、分布式锁、分布式事务。' },
          { name: '存储系统', desc: 'Redis缓存、MySQL主从复制、MongoDB分片、分布式文件系统。' },
          { name: '可观测性', desc: 'Tracing（Jaeger/Zipkin）、Logging（ELK/ Loki）、Metrics。' },
          { name: '混沌工程', desc: 'Chaos Mesh、故障注入、故障演练、恢复时间验证。' },
        ],
      },
    ],
    resources: [
      {
        type: '教材',
        title: '《SRE Google运维解密》',
        desc: 'SRE领域的圣经，Google的运维哲学。',
        link: 'https://book.douban.com/subject/26875203/',
      },
      {
        type: '教材',
        title: '《Kubernetes实战》',
        desc: '从入门到精通，大量实战案例。',
        link: 'https://book.douban.com/subject/34839901/',
      },
      {
        type: '视频课',
        title: 'Kubernetes官方教程',
        desc: 'CNCF官方课程，系统学习K8s。',
        link: 'https://kubernetes.io/docs/tutorials/',
      },
      {
        type: '开源项目',
        title: 'Prometheus/Grafana',
        desc: '监控系统全家桶，拿来就能用。',
        link: 'https://github.com/prometheus/prometheus',
      },
    ],
    project: [
      '搭建一个K8s集群（用kubeadm或k3s）',
      '部署一个简单的Web应用（如Nginx+Flask）',
      '配置Prometheus+Grafana监控',
      '写一个CI/CD Pipeline自动部署',
      '模拟故障：kill一个Pod，看自动重启',
      '配置HPA水平自动扩缩容',
      '做一次故障演练：模拟数据库宕机',
      '整理运维文档，记录SOP',
    ],
  },
  {
    id: 'db-kernel',
    category: '软件/系统类',
    title: '数据库内核工程师',
    companies: ['阿里云（OceanBase）', 'PingCAP（TiDB）', '华为（openGauss）', '字节跳动'],
    salary: '25K-60K',
    education: '硕士/博士',
    duration: '12-24个月入门',
    definition:
      '设计和优化数据库内核。存储引擎、查询优化器、事务管理、分布式一致性。是基础软件的核心岗位。',
    stages: [
      {
        stage: 'Stage 1',
        title: '筑基期',
        duration: '3-4个月',
        skills: [
          { name: 'SQL基础', desc: '熟练写复杂SQL。JOIN、子查询、窗口函数、CTE。' },
          { name: '数据库原理', desc: '关系模型、ACID、事务隔离级别、锁机制。' },
          { name: '数据结构', desc: 'B+树、LSM树、Hash表、跳表。各自适用场景。' },
          { name: 'C/C++编程', desc: '数据库内核主要用C++。内存管理、指针、STL、多线程。' },
        ],
      },
      {
        stage: 'Stage 2',
        title: '实战期',
        duration: '6-8个月',
        skills: [
          {
            name: '存储引擎',
            desc: '基于LSM树实现一个简单的KV存储。Write-Ahead Log、Compaction策略。',
          },
          { name: '查询优化器', desc: 'Cost-Based优化。算子选择、JOIN顺序、索引选择。' },
          { name: '事务实现', desc: 'MVCC多版本并发控制、2PL两阶段锁、死锁检测。' },
          {
            name: '分布式一致性',
            desc: 'Raft协议实现选主和日志复制。Leader选举、日志同步、快照。',
          },
        ],
      },
      {
        stage: 'Stage 3',
        title: '进阶期',
        duration: '12-24个月',
        skills: [
          { name: '分布式事务', desc: '2PC、3PC、TCC、Saga。分布式死锁检测。' },
          { name: '并行查询', desc: '向量化执行、算子下推、MPP架构。' },
          { name: 'HTAP混合负载', desc: 'OLTP和OLAP混合处理。列存、行存自适应。' },
          { name: '云原生数据库', desc: '弹性伸缩、Serverless、存算分离、数据湖。' },
        ],
      },
    ],
    resources: [
      {
        type: '教材',
        title: '《数据库系统概念》（Silberschatz）',
        desc: '数据库原理经典教材，第15版必读。',
        link: 'https://book.douban.com/subject/30220292/',
      },
      {
        type: '教材',
        title: '《数据密集型应用系统设计》',
        desc: '分布式系统圣经，深入讲解一致性、复制、分区。',
        link: 'https://book.douban.com/subject/30329536/',
      },
      {
        type: '论文',
        title: 'Raft论文',
        desc: '分布式一致性协议，易懂且实用。',
        link: 'https://raft.github.io/raft.pdf',
      },
      {
        type: '开源项目',
        title: 'RocksDB/TiDB',
        desc: 'LSM树存储引擎/分布式数据库，源码值得细读。',
        link: 'https://github.com/facebook/rocksdb',
      },
    ],
    project: [
      '用C++实现一个基于LSM树的KV存储引擎',
      '实现Put/Get/Delete操作',
      '实现WAL日志，保证崩溃恢复',
      '实现Compaction策略（Leveled/Universal）',
      '用Raft实现分布式复制',
      '实现简单的SQL解析器',
      '写性能测试，对比RocksDB',
      '整理成开源项目，放在GitHub',
    ],
  },
]

export const FOUNDATION_SKILLS = [
  { name: '电路分析', desc: '基尔霍夫定律、戴维南等效、频域分析。模拟数字通吃。' },
  { name: '信号与系统', desc: '傅里叶变换、拉普拉斯变换、卷积。射频/通信/图像全要用。' },
  { name: '半导体物理', desc: 'PN结、MOS管、能带理论。做芯片必须懂晶体管怎么工作。' },
  { name: 'C语言', desc: '芯片验证、算法仿真、嵌入式全用C。指针和结构体必须玩熟。' },
  { name: '线性代数', desc: '矩阵运算、SVD、特征值。AI算法、控制理论全用这些。' },
  { name: '概率论与统计', desc: '随机变量、贝叶斯、假设检验。机器学习、通信、量化的基础。' },
  { name: '数据结构与算法', desc: '图、树、哈希、动态规划。所有软件岗面试必考。' },
  { name: '操作系统原理', desc: '进程线程、内存管理、文件系统、中断。嵌入式/云计算的根基。' },
]

export const FOUNDATION_RESOURCES = [
  {
    type: '视频课',
    title: '电路分析基础（MIT 6.002）',
    desc: '从0讲电路，有中英字幕。',
    link: 'https://www.bilibili.com/video/BV1Es41127HY',
  },
  {
    type: '视频课',
    title: '信号与系统（奥本海姆）',
    desc: 'MIT经典课程，傅里叶变换讲得最透彻。',
    link: 'https://www.bilibili.com/video/BV1g94y1e7Bx',
  },
  {
    type: '教材',
    title: '《半导体物理与器件》（尼曼）',
    desc: '芯片行业的"圣经"，MOS管原理讲得一清二楚。',
    link: 'https://book.douban.com/subject/26366040/',
  },
  {
    type: '视频课',
    title: 'C语言入门到指针（翁凯）',
    desc: '国内公认最好的C语言入门课。',
    link: 'https://www.bilibili.com/video/BV1dr4y1n7yA',
  },
  {
    type: '视频课',
    title: '线性代数（MIT Gilbert Strang）',
    desc: 'MIT传奇教授，把矩阵讲得像故事一样。',
    link: 'https://www.bilibili.com/video/BV1ix41127m1',
  },
  {
    type: '在线刷题',
    title: 'LeetCode算法题库',
    desc: '数据结构与算法面试必刷。先刷Top 150，再刷Hard。',
    link: 'https://leetcode.cn/',
  },
  {
    type: '视频课',
    title: '操作系统（哈工大李治军）',
    desc: '国内最好的OS课，从Linux 0.11源码讲起。',
    link: 'https://www.bilibili.com/video/BV1d4411v7u7',
  },
  {
    type: '教材',
    title: '《概率论与数理统计》（茆诗松）',
    desc: '国内最实用的概率统计教材，例子多、推导细。',
    link: 'https://book.douban.com/subject/30220292/',
  },
]
