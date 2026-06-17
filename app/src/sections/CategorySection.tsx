import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { APITerm } from '@/api/types'
import type { DisciplineInfo } from '@/hooks/useDisciplines'
import TermCard from '@/components/TermCard'

interface CategorySectionProps {
  discipline: DisciplineInfo
  terms: APITerm[]
  highlightId?: string | null
  isVisible: boolean
}

export default function CategorySection({
  discipline,
  terms,
  highlightId,
  isVisible,
}: CategorySectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (highlightId) {
      const highlightedTerm = terms.find((term) => term.id === highlightId)
      if (highlightedTerm && sectionRef.current) {
        sectionRef.current.style.backgroundColor = discipline.color + '08'
        const timer = setTimeout(() => {
          if (sectionRef.current) {
            sectionRef.current.style.backgroundColor = 'transparent'
          }
        }, 2000)
        return () => clearTimeout(timer)
      }
    }
  }, [highlightId, terms, discipline.color])

  if (!isVisible) return null

  return (
    <section
      id={`category-${discipline.id}`}
      ref={sectionRef}
      className="py-8 sm:py-10 px-4 lg:px-6 transition-colors duration-2000"
    >
      <div className="max-w-[1200px] mx-auto">
        {/* 学科标题行 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mb-4 sm:mb-6"
        >
          <div className="flex items-center gap-3 mb-2 sm:mb-3">
            <div
              className="w-1 h-6 sm:h-8 rounded-full"
              style={{ backgroundColor: discipline.color }}
            />
            <h2 className="text-xl sm:text-2xl md:text-[28px] font-bold text-warm-dark dark:text-warm-text font-display">
              {discipline.name}
            </h2>
            <span className="text-xs sm:text-sm text-warm-text dark:text-warm-text">
              {terms.length} 个词条
            </span>
          </div>
          <p className="text-sm sm:text-[15px] text-warm-text dark:text-warm-text max-w-[800px] ml-4">
            {discipline.description}
          </p>
        </motion.div>

        {/* 词条卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {terms.map((term, index) => (
              <TermCard key={term.id} entry={term} index={index} highlightId={highlightId} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
