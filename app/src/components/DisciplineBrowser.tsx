import { useMemo } from 'react'
import { useNavigate, Link } from 'react-router'
import { motion } from 'framer-motion'
import { ArrowRight, Clock, Send } from 'lucide-react'
import { useDisciplines } from '@/hooks/useDisciplines'
import { useTerms } from '@/hooks/useTerms'

export default function DisciplineBrowser() {
  const navigate = useNavigate()
  const { disciplines } = useDisciplines()
  const { terms } = useTerms()

  const counts = useMemo(() => {
    const map: Record<string, number> = {}
    terms.forEach((t) => {
      map[t.discipline] = (map[t.discipline] || 0) + 1
    })
    return map
  }, [terms])

  return (
    <section className="py-12 sm:py-16 px-4 lg:px-6 bg-warm-bg dark:bg-warm-bg">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mb-8 sm:mb-10"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="w-1 h-8 rounded-full bg-warm-accent" />
            <h2 className="text-2xl sm:text-3xl font-bold text-warm-dark dark:text-warm-text font-display">
              浏览学科
            </h2>
          </div>
          <p className="text-warm-text ml-4 max-w-[600px]">
            每个学科都是独立页面，点进去看大白话解释和跨学科别名。
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {disciplines.map((discipline, index) => {
            const count = counts[discipline.id] || 0
            return (
              <motion.button
                key={discipline.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
                onClick={() => navigate(`/discipline/${discipline.id}`)}
                className="group text-left p-5 rounded-xl bg-white dark:bg-warm-card border border-warm-border hover:border-warm-accent/40 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-3 h-10 rounded-full"
                    style={{ backgroundColor: discipline.color }}
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-warm-dark dark:text-warm-text font-display">
                      {discipline.name}
                    </h3>
                    <span className="text-xs text-warm-text">{count} 个词条</span>
                  </div>
                </div>
                <p className="text-sm text-warm-text leading-relaxed line-clamp-2 mb-4">
                  {discipline.description}
                </p>
                <div className="flex items-center text-sm font-medium text-warm-accent group-hover:translate-x-1 transition-transform">
                  进入学科
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </motion.button>
            )
          })}

          {/* 页脚相关入口，与学科卡片排在一起 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: disciplines.length * 0.05, ease: 'easeOut' }}
          >
            <Link
              to="/timeline"
              className="group flex flex-col h-full p-5 rounded-xl bg-white dark:bg-warm-card border border-warm-border hover:border-warm-accent/40 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-10 rounded-full bg-warm-accent" />
                <h3 className="text-lg font-semibold text-warm-dark dark:text-warm-text font-display">
                  术语时间线
                </h3>
              </div>
              <p className="text-sm text-warm-text leading-relaxed line-clamp-2 mb-4 flex-1">
                按时间顺序浏览术语的演变与流行过程。
              </p>
              <div className="flex items-center text-sm font-medium text-warm-accent group-hover:translate-x-1 transition-transform">
                查看时间线
                <Clock className="w-4 h-4 ml-1" />
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: (disciplines.length + 1) * 0.05, ease: 'easeOut' }}
          >
            <Link
              to="/submit"
              className="group flex flex-col h-full p-5 rounded-xl bg-white dark:bg-warm-card border border-warm-border hover:border-warm-accent/40 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-10 rounded-full bg-disc-econ" />
                <h3 className="text-lg font-semibold text-warm-dark dark:text-warm-text font-display">
                  提交同物异名
                </h3>
              </div>
              <p className="text-sm text-warm-text leading-relaxed line-clamp-2 mb-4 flex-1">
                发现有价值的术语别名？欢迎补充提交。
              </p>
              <div className="flex items-center text-sm font-medium text-warm-accent group-hover:translate-x-1 transition-transform">
                去提交
                <Send className="w-4 h-4 ml-1" />
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
