import { motion } from 'framer-motion'
import type { CrossDisciplineEntry } from '@/types'
import { DISCIPLINES } from '@/types'

interface ConnectionCardProps {
  entry: CrossDisciplineEntry
  index: number
}

export default function ConnectionCard({ entry, index }: ConnectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
      className="flex-shrink-0 w-[calc(100vw-2rem)] sm:w-[320px] md:w-[280px] bg-white rounded-xl p-5 sm:p-6 border border-warm-border"
    >
      {/* 渐变色条 */}
      <div
        className="h-1 w-full rounded-full mb-4"
        style={{
          background: `linear-gradient(to right, ${entry.names
            .map((n) => DISCIPLINES.find((d) => d.id === n.discipline)?.color || '#8B7D6B')
            .join(', ')})`,
        }}
      />

      {/* 概念标题 */}
      <h4 className="text-base font-semibold text-warm-dark mb-4 font-display">{entry.concept}</h4>

      {/* 多学科叫法 */}
      <div className="space-y-2 mb-4">
        {entry.names.map((name, i) => {
          const disc = DISCIPLINES.find((d) => d.id === name.discipline)
          return (
            <div key={i} className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: disc?.color }}
              />
              <span className="text-xs text-warm-text">{disc?.name}</span>
              <span className="text-sm text-warm-dark">{name.name}</span>
            </div>
          )
        })}
      </div>

      {/* 总结 */}
      <p className="text-xs text-warm-text leading-relaxed border-t border-warm-border pt-3">
        {entry.summary}
      </p>
    </motion.div>
  )
}
