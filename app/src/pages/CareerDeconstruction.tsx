import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router'
import {
  ArrowLeft,
  Shield,
  Brain,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Swords,
  CheckCircle,
  BookOpen,
  Quote,
  Crosshair,
  TrendingUp,
} from 'lucide-react'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'
import {
  COGNITIVE_MAP_POINTS,
  WATCHDOG_LAWS,
  WATCHDOG_FORMULA,
  WATCHDOG_INDUSTRIES,
  HEMATOPOIESIS_TRAITS,
  HEMATOPOIESIS_LEVELS,
  MIGRATION_RULES,
  COGNITIVE_BIASES,
  GHOST_TALKS,
  DETECTION_QUESTIONS,
  SYNONYM_TABLE,
  MASTER_FRAMEWORKS,
  QUICK_QUOTES,
  CAREER_NAV_ITEMS,
} from '@/data/career_data'
import type { WatchdogIndustry } from '@/data/career_data'
import SectionAnchor from '@/components/SectionAnchor'
import SectionTitle from '@/components/SectionTitle'
import StarRating from '@/components/StarRating'
import SideNav from '@/components/SideNav'
import type { SideNavItem } from '@/components/SideNav'

/* ============================================================
   职业解构页面 -- Career Deconstruction Module
   ============================================================ */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

/* -------- 导航条（本页内） -------- */
function PageNavBar() {
  const navigate = useNavigate()
  const { scrollTo } = useSmoothScroll()
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-warm-bg/80 dark:bg-[#1C1B1A]/90 backdrop-blur-xl border-b border-warm-border">
      <div className="max-w-[1200px] mx-auto h-full flex items-center justify-between px-4 lg:px-6">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 flex-shrink-0">
          <ArrowLeft className="w-5 h-5 text-warm-text" />
          <span className="text-xl font-bold text-warm-dark dark:text-[#F0EEE7] font-display">
            职业解构
          </span>
        </button>

        <div className="hidden lg:flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {CAREER_NAV_ITEMS.slice(0, 6).map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-warm-text hover:text-warm-accent hover:bg-warm-accent/10 transition-colors whitespace-nowrap"
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate('/antibody')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-warm-text hover:text-warm-accent hover:bg-warm-accent/10 transition-colors"
        >
          <Shield className="w-3.5 h-3.5" />
          概念抗体
        </button>
      </div>
    </nav>
  )
}

/* ============================================================
   HERO 区域
   ============================================================ */
function HeroSection() {
  const navigate = useNavigate()
  return (
    <section className="pt-[120px] pb-16 px-4 lg:px-6">
      <motion.div
        className="max-w-[1200px] mx-auto text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={itemVariants}
          className="w-[120px] h-px bg-warm-border mx-auto mb-8"
        />

        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-[56px] font-bold text-warm-dark dark:text-[#F0EEE7] leading-tight tracking-tight font-display"
        >
          职业解构
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-lg md:text-[22px] text-warm-text mt-5 max-w-[640px] mx-auto leading-relaxed"
        >
          看穿行业忽悠，找到你的造血岗位。
          <br className="hidden md:block" />
          造血的吃肉，看门的啃骨头——你吃的是哪种？
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-6 md:gap-10 mt-8"
        >
          {[
            { n: '24', l: '认知偏差' },
            { n: '8', l: '鬼话拆解' },
            { n: '14', l: '自测问题' },
            { n: '10', l: '核心卷章' },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-warm-accent">{s.n}</div>
              <div className="text-xs text-warm-text mt-0.5">{s.l}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-8 flex items-center justify-center gap-3 flex-wrap"
        >
          <button
            onClick={() =>
              document.getElementById('watchdog-economics')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="inline-flex items-center gap-1.5 px-6 py-3 rounded-lg text-white text-sm font-semibold bg-gradient-to-br from-[#D4853B] to-[#E8A85C] hover:scale-[1.02] hover:shadow-glow transition-all"
          >
            <Crosshair className="w-4 h-4" />
            识别看门狗
          </button>
          <button
            onClick={() =>
              document.getElementById('detection-tool')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="inline-flex items-center gap-1.5 px-5 py-3 rounded-lg text-warm-dark text-sm font-semibold bg-white border-2 border-warm-border hover:border-warm-accent hover:text-warm-accent transition-all"
          >
            <Swords className="w-4 h-4" />
            14问自测
          </button>
          <button
            onClick={() => navigate('/antibody')}
            className="inline-flex items-center gap-1.5 px-5 py-3 rounded-lg text-warm-text text-sm font-medium hover:text-warm-accent transition-all"
          >
            <Shield className="w-4 h-4" />
            概念抗体
          </button>
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ============================================================
   卷零：认知地图 5 坐标
   ============================================================ */
function CognitiveMapSection() {
  return (
    <SectionAnchor id="cognitive-map">
      <section className="py-12 px-4 lg:px-6">
        <div className="max-w-[1200px] mx-auto">
          <SectionTitle
            icon={Brain}
            title="认知地图"
            subtitle="在翻开后面各卷之前，先建立这5个基础坐标"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {COGNITIVE_MAP_POINTS.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="bg-white dark:bg-[#252423] rounded-xl border border-warm-border p-5 shadow-card hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-warm-accent/10 text-warm-accent text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <h3 className="font-bold text-warm-dark text-sm">{p.title}</h3>
                </div>
                <p className="text-warm-text text-sm leading-relaxed mb-3">{p.content}</p>
                <div className="bg-warm-bg rounded-lg px-3 py-2">
                  <p className="text-xs text-warm-accent italic">"{p.quote}"</p>
                  <p className="text-xs text-warm-text mt-0.5">—— {p.author}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </SectionAnchor>
  )
}

/* ============================================================
   卷三：看门狗经济学核心
   ============================================================ */
function WatchdogFormula() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="bg-warm-dark rounded-xl p-6 text-center mb-8"
    >
      <p className="text-white/60 text-xs mb-2">看门狗价值公式</p>
      <p className="text-2xl md:text-3xl font-bold text-warm-accent font-display mb-2">
        {WATCHDOG_FORMULA.formula}
      </p>
      <p className="text-white/70 text-sm">{WATCHDOG_FORMULA.note}</p>
    </motion.div>
  )
}

function WatchdogLawCard({ law, index }: { law: (typeof WATCHDOG_LAWS)[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-[#252423] rounded-xl border-l-4 border-warm-accent p-5 shadow-card"
      style={{ borderLeftColor: '#D4853B' }}
    >
      <div className="flex items-start gap-3">
        <span className="w-8 h-8 rounded-full bg-warm-accent/10 text-warm-accent text-sm font-bold flex items-center justify-center flex-shrink-0">
          {index + 1}
        </span>
        <div>
          <h3 className="font-bold text-warm-dark text-sm mb-1">{law.title}</h3>
          <p className="text-warm-accent text-xs font-medium mb-1.5">{law.subtitle}</p>
          <p className="text-warm-text text-sm leading-relaxed">{law.content}</p>
        </div>
      </div>
    </motion.div>
  )
}

function IndustryCard({ industry }: { industry: WatchdogIndustry }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <motion.div
      layout
      className="bg-white dark:bg-[#252423] rounded-xl border border-warm-border shadow-card overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-warm-bg/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-warm-accent flex-shrink-0" />
          <div>
            <h3 className="font-bold text-warm-dark text-sm">{industry.name}</h3>
            <StarRating rating={industry.rating} />
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-warm-text" />
        ) : (
          <ChevronDown className="w-4 h-4 text-warm-text" />
        )}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0">
              <p className="text-warm-text text-sm mb-3">{industry.description}</p>
              <div className="bg-red-50 rounded-lg p-3 mb-3">
                <p className="text-xs text-red-700 font-medium mb-1.5">痛点：</p>
                <ul className="space-y-1">
                  {industry.painPoints.map((p) => (
                    <li key={p} className="text-xs text-red-600 flex items-start gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-green-700 font-medium mb-1">出路：</p>
                <p className="text-xs text-green-600">{industry.escapeRoute}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function WatchdogEconomicsSection() {
  return (
    <SectionAnchor id="watchdog-economics">
      <section className="py-12 px-4 lg:px-6 bg-white/50 dark:bg-[#252423]/50">
        <div className="max-w-[1200px] mx-auto">
          <SectionTitle
            icon={AlertTriangle}
            title="看门狗经济学"
            subtitle="解剖那些「只投入、不产出」的防御性行业和岗位"
          />

          <WatchdogFormula />

          <h3 className="text-lg font-bold text-warm-dark mb-4 font-display">三大铁律</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {WATCHDOG_LAWS.map((law, i) => (
              <WatchdogLawCard key={law.title} law={law} index={i} />
            ))}
          </div>

          <h3 className="text-lg font-bold text-warm-dark mb-4 font-display">全球八大看门狗行业</h3>
          <p className="text-sm text-warm-text mb-4">
            点击展开查看痛点与出路（星级越高 = 看门狗指数越高）
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
            {WATCHDOG_INDUSTRIES.map((ind) => (
              <IndustryCard key={ind.name} industry={ind} />
            ))}
          </div>
        </div>
      </section>
    </SectionAnchor>
  )
}

/* ============================================================
   造血指南
   ============================================================ */
function HematopoiesisSection() {
  return (
    <SectionAnchor id="hematopoiesis">
      <section className="py-12 px-4 lg:px-6">
        <div className="max-w-[1200px] mx-auto">
          <SectionTitle
            icon={TrendingUp}
            title="造血指南"
            subtitle="从看门狗到造血型的迁移路线图"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* 造血型特征 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-green-50 rounded-xl border border-green-200 p-5"
            >
              <h3 className="font-bold text-green-800 text-sm mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                造血型行业的三大特征
              </h3>
              <ul className="space-y-2">
                {HEMATOPOIESIS_TRAITS.map((t) => (
                  <li key={t} className="text-sm text-green-700 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* 迁移原则 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-amber-50 rounded-xl border border-amber-200 p-5"
            >
              <h3 className="font-bold text-amber-800 text-sm mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                迁移路线设计原则
              </h3>
              <ul className="space-y-2">
                {MIGRATION_RULES.map((r, i) => (
                  <li key={r} className="text-sm text-amber-700 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {r}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* 造血层级 */}
          <h3 className="text-lg font-bold text-warm-dark mb-4 font-display">造血强度分级</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {HEMATOPOIESIS_LEVELS.map((level, i) => (
              <motion.div
                key={level.level}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-[#252423] rounded-xl border border-warm-border p-5 shadow-card"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-warm-accent font-display">
                    {level.level}
                  </span>
                  <span className="text-xs text-warm-text bg-warm-bg px-2 py-0.5 rounded-full">
                    {level.desc}
                  </span>
                </div>
                <p className="text-sm text-warm-text leading-relaxed">{level.examples}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </SectionAnchor>
  )
}

/* ============================================================
   卷四：认知偏差 24 条
   ============================================================ */
function CognitiveBiasesSection() {
  const [selectedBias, setSelectedBias] = useState<number | null>(null)

  return (
    <SectionAnchor id="cognitive-biases">
      <section className="py-12 px-4 lg:px-6 bg-white/50 dark:bg-[#252423]/50">
        <div className="max-w-[1200px] mx-auto">
          <SectionTitle
            icon={Brain}
            title="认知偏差"
            subtitle="24个大脑漏洞 —— Kahneman《思考，快与慢》版"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-6">
            {COGNITIVE_BIASES.map((bias) => (
              <button
                key={bias.id}
                onClick={() => setSelectedBias(selectedBias === bias.id ? null : bias.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedBias === bias.id
                    ? 'border-warm-accent bg-warm-accent/10'
                    : 'border-warm-border bg-white hover:border-warm-accent/50'
                }`}
              >
                <span className="text-xs text-warm-accent font-bold">#{bias.id}</span>
                <p className="text-sm font-medium text-warm-dark mt-0.5">{bias.name}</p>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {selectedBias && (
              <motion.div
                key={selectedBias}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-warm-dark rounded-xl p-5"
              >
                {(() => {
                  const bias = COGNITIVE_BIASES.find((b) => b.id === selectedBias)!
                  return (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-warm-accent text-xs font-bold">#{bias.id}</span>
                        <h3 className="font-bold text-white text-base">{bias.name}</h3>
                      </div>
                      <p className="text-white/80 text-sm mb-3">{bias.description}</p>
                      <div className="bg-white/10 rounded-lg px-3 py-2">
                        <p className="text-xs text-warm-accent font-medium">对策</p>
                        <p className="text-sm text-white/90">{bias.countermeasure}</p>
                      </div>
                    </>
                  )
                })()}
              </motion.div>
            )}
          </AnimatePresence>

          {!selectedBias && (
            <p className="text-center text-sm text-warm-text">点击上方任意卡片查看详情与对策</p>
          )}
        </div>
      </section>
    </SectionAnchor>
  )
}

/* ============================================================
   卷九：8 句全球鬼话
   ============================================================ */
function GhostTalksSection() {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  return (
    <SectionAnchor id="ghost-talks">
      <section className="py-12 px-4 lg:px-6">
        <div className="max-w-[1200px] mx-auto">
          <SectionTitle
            icon={Swords}
            title="全球话术拆解"
            subtitle="8句鬼话与怼法 —— 全球通用的忽悠模板"
          />

          <div className="space-y-3">
            {GHOST_TALKS.map((talk) => (
              <motion.div
                key={talk.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: talk.id * 0.05 }}
                className="bg-white dark:bg-[#252423] rounded-xl border border-warm-border shadow-card overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(expandedId === talk.id ? null : talk.id)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-warm-bg/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-red-100 text-red-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {talk.id}
                    </span>
                    <div>
                      <p className="font-bold text-warm-dark text-sm">{talk.chinese}</p>
                      <p className="text-xs text-warm-text">{talk.english}</p>
                    </div>
                  </div>
                  {expandedId === talk.id ? (
                    <ChevronUp className="w-4 h-4 text-warm-text" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-warm-text" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedId === talk.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3">
                        <div className="bg-warm-bg rounded-lg p-3">
                          <p className="text-xs text-warm-text mb-1">谁在讲 · 背后逻辑</p>
                          <p className="text-sm text-warm-dark">
                            {talk.speaker} —— {talk.logic}
                          </p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-3">
                          <p className="text-xs text-red-600 mb-1">怼法</p>
                          <p className="text-sm text-red-800 font-medium">{talk.counter}</p>
                        </div>
                        <div className="bg-warm-accent/10 rounded-lg p-3">
                          <p className="text-xs text-warm-accent mb-1">{talk.author}</p>
                          <p className="text-sm text-warm-dark italic">"{talk.quote}"</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </SectionAnchor>
  )
}

/* ============================================================
   卷八：14 问交叉检测表
   ============================================================ */
function DetectionToolSection() {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set())

  const toggleCheck = (id: number) => {
    const next = new Set(checkedItems)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setCheckedItems(next)
  }

  const warningLevel = checkedItems.size >= 3 ? 'high' : checkedItems.size >= 1 ? 'medium' : 'low'

  return (
    <SectionAnchor id="detection-tool">
      <section className="py-12 px-4 lg:px-6 bg-white/50 dark:bg-[#252423]/50">
        <div className="max-w-[1200px] mx-auto">
          <SectionTitle
            icon={Crosshair}
            title="14问交叉检测"
            subtitle="面试/转行/报班前，用这14个问题交叉验证"
          />

          <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 mb-6">
            <p className="text-sm text-amber-800">
              <strong>使用说明：</strong>勾选你遇到的场景。如果有 <strong>3 个以上</strong>
              答「是」，这就是陷阱。 当前勾选：<strong>{checkedItems.size}</strong> 个 ——
              {warningLevel === 'high' && (
                <span className="text-red-600 font-bold"> 警告！高度疑似忽悠陷阱</span>
              )}
              {warningLevel === 'medium' && (
                <span className="text-amber-700 font-bold"> 注意，存在可疑信号</span>
              )}
              {warningLevel === 'low' && (
                <span className="text-green-700 font-bold"> 目前安全</span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DETECTION_QUESTIONS.map((q) => {
              const isChecked = checkedItems.has(q.id)
              return (
                <motion.button
                  key={q.id}
                  onClick={() => toggleCheck(q.id)}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isChecked
                      ? 'border-red-300 bg-red-50'
                      : 'border-warm-border bg-white hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isChecked ? 'bg-red-500 border-red-500' : 'border-warm-text/30'
                      }`}
                    >
                      {isChecked && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-warm-dark mb-0.5">{q.talk}</p>
                      <p className="text-xs text-warm-text">{q.concept}</p>
                      {isChecked && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-red-600 mt-1.5 font-medium"
                        >
                          反问：{q.question}
                        </motion.p>
                      )}
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>
      </section>
    </SectionAnchor>
  )
}

/* ============================================================
   同物异名大表
   ============================================================ */
function SynonymsSection() {
  return (
    <SectionAnchor id="synonyms">
      <section className="py-12 px-4 lg:px-6">
        <div className="max-w-[1200px] mx-auto">
          <SectionTitle
            icon={BookOpen}
            title="同物异名大表"
            subtitle="同一个现象，在不同学科里叫不同名字——掌握它们，看穿换皮忽悠"
          />

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-warm-dark text-white">
                  <th className="px-3 py-2 text-left font-medium rounded-tl-lg">现象</th>
                  <th className="px-3 py-2 text-left font-medium">经济学</th>
                  <th className="px-3 py-2 text-left font-medium">社会学</th>
                  <th className="px-3 py-2 text-left font-medium">管理学</th>
                  <th className="px-3 py-2 text-left font-medium">心理学</th>
                  <th className="px-3 py-2 text-left font-medium rounded-tr-lg">日常说法</th>
                </tr>
              </thead>
              <tbody>
                {SYNONYM_TABLE.map((row, i) => (
                  <tr
                    key={row.phenomenon}
                    className={`border-b border-warm-border ${i % 2 === 0 ? 'bg-white dark:bg-[#252423]' : 'bg-warm-bg/50'}`}
                  >
                    <td className="px-3 py-2.5 font-medium text-warm-dark">{row.phenomenon}</td>
                    <td className="px-3 py-2.5 text-warm-text">{row.economics}</td>
                    <td className="px-3 py-2.5 text-warm-text">{row.sociology}</td>
                    <td className="px-3 py-2.5 text-warm-text">{row.management}</td>
                    <td className="px-3 py-2.5 text-warm-text">{row.psychology}</td>
                    <td className="px-3 py-2.5 text-warm-text">{row.daily}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </SectionAnchor>
  )
}

/* ============================================================
   大师框架
   ============================================================ */
function MastersSection() {
  return (
    <SectionAnchor id="masters">
      <section className="py-12 px-4 lg:px-6 bg-white/50 dark:bg-[#252423]/50">
        <div className="max-w-[1200px] mx-auto">
          <SectionTitle
            icon={BookOpen}
            title="全球认知框架"
            subtitle="四位大师的思想武器——卡尼曼、Naval、Manson、Harari"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MASTER_FRAMEWORKS.map((master, i) => (
              <motion.div
                key={master.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-[#252423] rounded-xl border border-warm-border p-5 shadow-card"
              >
                <h3 className="font-bold text-warm-dark text-base mb-0.5">{master.name}</h3>
                <p className="text-xs text-warm-accent mb-3">{master.book}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {master.keyConcepts.map((c) => (
                    <span
                      key={c}
                      className="px-2 py-0.5 bg-warm-bg rounded-full text-xs text-warm-text"
                    >
                      {c}
                    </span>
                  ))}
                </div>
                {master.quotes.map((q, j) => (
                  <p
                    key={j}
                    className="text-sm text-warm-text italic border-l-2 border-warm-accent pl-3 mt-2"
                  >
                    "{q}"
                  </p>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </SectionAnchor>
  )
}

/* ============================================================
   金句速查
   ============================================================ */
function QuotesSection() {
  return (
    <SectionAnchor id="quotes">
      <section className="py-12 px-4 lg:px-6">
        <div className="max-w-[1200px] mx-auto">
          <SectionTitle icon={Quote} title="金句速查" subtitle="一针见血的话，记下来，随时用" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {QUICK_QUOTES.map((q, i) => (
              <motion.div
                key={q.text}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-warm-dark rounded-lg p-4"
              >
                <p className="text-white text-sm leading-relaxed mb-2">"{q.text}"</p>
                <p className="text-white/50 text-xs">—— {q.source}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </SectionAnchor>
  )
}

/* ============================================================
   主页面
   ============================================================ */
export default function CareerDeconstruction() {
  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#1C1B1A]">
      <PageNavBar />
      <SideNav items={CAREER_NAV_ITEMS as SideNavItem[]} />

      <HeroSection />
      <CognitiveMapSection />
      <WatchdogEconomicsSection />
      <HematopoiesisSection />
      <CognitiveBiasesSection />
      <GhostTalksSection />
      <DetectionToolSection />
      <SynonymsSection />
      <MastersSection />
      <QuotesSection />

      {/* 底部 */}
      <footer className="py-8 text-center border-t border-warm-border bg-white/30 dark:bg-[#252423]/30">
        <p className="text-sm text-warm-text">职业解构模块 · 融合中国话语解剖与全球认知科学</p>
        <p className="text-xs text-warm-text/60 mt-1">
          数据来源：《认知防忽悠手册_全球整合版》2026年5月
        </p>
      </footer>
    </div>
  )
}
