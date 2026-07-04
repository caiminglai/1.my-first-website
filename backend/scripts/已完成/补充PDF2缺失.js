const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, '..', 'data', '同物异名.db'));

// 查看当前计算机学科最大ID
const maxRow = db.prepare("SELECT 词条ID FROM 词条 WHERE 学科='计算机' ORDER BY 词条ID DESC LIMIT 1").get();
console.log('当前计算机最大ID:', maxRow);

const insert = db.prepare('INSERT OR IGNORE INTO 词条 (词条ID, 学科, 名称, 翻译, 本质, 提示, 跨学科别名, 热度) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');

const data = [
  {
    id: 'c139',
    name: 'GRU',
    trans: '简化版LSTM',
    essence: '门控循环单元，用更少的门（重置门和更新门）实现类似LSTM的效果。参数更少，训练更快，效果接近。LSTM有三个门（遗忘门、输入门、输出门），GRU合并成两个，是LSTM的精简版。',
    hint: 'GRU=LSTM的精简版，少一个门但效果差不多。',
    aliases: '["门控循环单元", "Gated Recurrent Unit"]',
    hot: 0
  },
  {
    id: 'c140',
    name: '上下文窗口',
    trans: 'AI一次能"看"多少文字',
    essence: '大语言模型一次能处理的文本长度（以token计）。GPT-3.5的上下文窗口是4096个token（约3000字），GPT-4可以到128K。就像你的工作记忆——能同时记住多少东西。超过窗口的内容模型就"忘了"。',
    hint: '上下文窗口=AI的工作记忆容量，超出就忘。',
    aliases: '["Context Window"]',
    hot: 0
  },
  {
    id: 'c141',
    name: '掩码',
    trans: '遮住不让看',
    essence: '训练时隐藏部分输入，防止模型"偷看答案"。BERT做掩码语言模型时遮住15%的词让模型猜；Transformer的解码器用掩码遮住未来时刻的信息，防止模型看到还没生成的内容。本质就是盖住一部分。',
    hint: '掩码=盖住一部分不让看，防止偷看答案。',
    aliases: '["Mask", "遮罩"]',
    hot: 0
  },
  {
    id: 'c142',
    name: '计算图',
    trans: '运算流程图',
    essence: '用图（节点+边）表示计算过程：节点是操作（加法、乘法、卷积），边是数据流动方向。TensorFlow的名字就来自"张量在计算图中的流动"。自动微分就是沿着这张图反向应用链式法则。',
    hint: '计算图=画一张图表示先算什么后算什么。',
    aliases: '["Computational Graph", "运算流程图"]',
    hot: 0
  },
  {
    id: 'c143',
    name: '前向传播',
    trans: '函数求值，从输入算到输出',
    essence: '从输入层到输出层逐层计算，得到模型预测结果。就是"代入函数算结果"——数据从输入进去，经过一层层函数变换，最后输出预测值。反向传播则是反过来，从输出误差倒推每层参数的梯度。',
    hint: '前向传播=代入函数算结果，从输入一路算到输出。',
    aliases: '["Forward Propagation", "前向计算"]',
    hot: 0
  },
  {
    id: 'c144',
    name: '图灵测试',
    trans: '能不能骗过人',
    essence: '图灵1950年提出：如果一台机器隔着屏幕和人聊天，人分辨不出对方是机器还是人，就说机器"通过了图灵测试"。本质是行为主义的智能判定——不看内部怎么运作，只看外在表现能不能以假乱真。至今没有AI真正通过严格的图灵测试。',
    hint: '图灵测试=隔着屏幕聊天，你分不清对面是人还是机器。',
    aliases: '["Turing Test", "图灵检验"]',
    hot: 0
  },
  {
    id: 'c145',
    name: '中文房间',
    trans: '按规则操作不等于理解',
    essence: '哲学家塞尔1980年提出的思想实验：一个不懂中文的人关在房间里，按规则手册把中文字符组合成回答递出去——外面的人以为房间里有个懂中文的人。结论：即使机器的行为看起来"懂了"，按规则操作符号不等于真正的理解。这是对图灵测试的经典反驳。',
    hint: '中文房间=不懂中文也能"回答"中文问题，按规则操作≠理解。',
    aliases: '["Chinese Room", "塞尔思想实验"]',
    hot: 0
  },
  {
    id: 'c146',
    name: '状态',
    trans: '当前情况的完整描述',
    essence: '强化学习术语，指环境在某一时刻的快照——描述了"现在什么情况"。下棋时棋盘上所有棋子的位置就是一个状态。马尔可夫性质要求未来只依赖当前状态，与历史无关。策略就是"遇到什么状态就采取什么动作"的规则。',
    hint: '状态=现在什么情况，环境的当前快照。',
    aliases: '["State", "状态空间(集合)"]',
    hot: 0
  },
  {
    id: 'c147',
    name: '奖励',
    trans: '即时反馈分数',
    essence: '强化学习术语，环境对智能体某个动作的即时评价。训狗时给零食就是奖励——告诉狗"刚才那个动作对了"。AlphaGo赢一局得+1分，输一局得-1分，这个分数就是奖励。奖励函数定义了"什么是好的行为"。',
    hint: '奖励=即时打分，告诉AI这步做得对不对。',
    aliases: '["Reward", "奖赏信号", "强化信号"]',
    hot: 0
  }
];

const batchInsert = db.transaction((items) => {
  for (const e of items) {
    const result = insert.run(e.id, '计算机', e.name, e.trans, e.essence, e.hint, e.aliases || '[]', e.hot);
    console.log(`${e.id} ${e.name}: ${result.changes > 0 ? '已插入' : '已存在跳过'}`);
  }
});

batchInsert(data);

// 验证
const count = db.prepare("SELECT COUNT(*) as cnt FROM 词条 WHERE 学科='计算机'").get();
console.log(`\n计算机学科现有词条数: ${count.cnt}`);
const total = db.prepare("SELECT COUNT(*) as cnt FROM 词条").get();
console.log(`数据库总词条数: ${total.cnt}`);

db.close();
