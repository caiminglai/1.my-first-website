import { motion, type Variants } from 'framer-motion'
import { useNavigate } from 'react-router'
import { Shield, Briefcase, Layers } from 'lucide-react'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'
import { useDisciplines } from '@/hooks/useDisciplines'
import { useStats } from '@/hooks/useStats'

export default function HeroSection() {
  const { scrollTo } = useSmoothScroll()
  const navigate = useNavigate()
  const { disciplines } = useDisciplines()
  const { stats } = useStats()

  // 使用后端返回的真实总数，如果加载失败则 fallback 到估算值
  const totalTerms = stats?.totalTerms || 9000

  const statsDisplay = [
    { number: `${totalTerms}+`, label: '词条收录' },
    { number: String(disciplines.length), label: '学科领域' },
    { number: '\u221e', label: '跨界连接' },
  ]

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  }

  return (
    <section className="pt-[100px] sm:pt-[120px] pb-12 sm:pb-20 px-4 lg:px-6">
      <motion.div
        className="max-w-[1200px] mx-auto text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 顶部装饰线 */}
        <motion.div
          variants={itemVariants}
          className="w-[100px] sm:w-[120px] h-px bg-warm-border mx-auto mb-8 sm:mb-10"
        />

        {/* 主标题 */}
        <motion.h1
          variants={itemVariants}
          className="text-3xl sm:text-4xl md:text-[56px] font-bold text-warm-dark dark:text-warm-text leading-tight tracking-tight font-display hero-title"
        >
          your_name
        </motion.h1>

        {/* 副标题 */}
        <motion.p
          variants={itemVariants}
          className="text-base sm:text-lg md:text-[22px] text-warm-text dark:text-warm-text mt-4 sm:mt-6 max-w-[600px] mx-auto leading-relaxed hero-subtitle"
        >
          同一个本质，在不同学科里换了个马甲。我们帮你把马甲扒下来。
        </motion.p>

        {/* 核心数据 */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-6 sm:gap-8 md:gap-[60px] mt-8 sm:mt-10"
        >
          {statsDisplay.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-warm-accent">
                {stat.number}
              </div>
              <div className="text-xs sm:text-sm text-warm-text mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* CTA按钮 -- 三大模块入口 */}
        <motion.div
          variants={itemVariants}
          className="mt-8 sm:mt-10 flex items-center justify-center gap-2 sm:gap-3 flex-wrap"
        >
          <button
            onClick={() => scrollTo('search-section')}
            className="inline-flex items-center justify-center px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-lg
              text-white text-sm sm:text-base font-semibold
              bg-gradient-to-br from-[#D4853B] to-[#E8A85C]
              hover:scale-[1.02] hover:shadow-glow transition-all duration-200"
          >
            开始探索
          </button>
          <button
            onClick={() => navigate('/antibody')}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-lg
              text-warm-dark dark:text-warm-text text-sm sm:text-base font-semibold
              bg-white dark:bg-warm-card border-2 border-warm-border
              hover:border-warm-accent hover:text-warm-accent hover:shadow-md transition-all duration-200"
          >
            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            概念抗体
          </button>
          <button
            onClick={() => navigate('/deconstruction')}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-lg
              text-warm-dark dark:text-warm-text text-sm sm:text-base font-semibold
              bg-white dark:bg-warm-card border-2 border-warm-border
              hover:border-warm-accent hover:text-warm-accent hover:shadow-md transition-all duration-200"
          >
            <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
            职业解构
          </button>
          <button
            onClick={() => navigate('/tech')}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-lg
              text-warm-dark dark:text-warm-text text-sm sm:text-base font-semibold
              bg-white dark:bg-warm-card border-2 border-warm-border
              hover:border-warm-accent hover:text-warm-accent hover:shadow-md transition-all duration-200"
          >
            <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
            岗位拆解
          </button>
        </motion.div>

        {/* 底部装饰 */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-2 mt-10"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-warm-accent" />
          <span className="w-1.5 h-1.5 rounded-full bg-warm-accent opacity-60" />
          <span className="w-1.5 h-1.5 rounded-full bg-warm-accent opacity-30" />
        </motion.div>
      </motion.div>
    </section>
  )
}
