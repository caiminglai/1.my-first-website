import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, RefreshCw, ShieldCheck } from 'lucide-react'
import { useDisciplines } from '@/hooks/useDisciplines'
import type { APITerm } from '@/api/types'
import { useFavorites } from '@/hooks/useFavorites'
import { getRandomTerm } from '@/api/services'

interface TodayRecommendProps {
  onHighlightTerm?: (term: APITerm) => void
}

export default function TodayRecommend({ onHighlightTerm }: TodayRecommendProps) {
  const [term, setTerm] = useState<APITerm | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { disciplines } = useDisciplines()
  const { isFavorite, toggleFavorite } = useFavorites()

  const fetchRandomTerm = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const t = await getRandomTerm()
      setTerm({
        id: t.id,
        discipline: t.discipline,
        name: t.name,
        translation: t.translation,
        essence: t.essence,
        tip: t.tip,
        hot: t.hot || 0,
      })
    } catch {
      setError('加载失败')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRandomTerm()
  }, [fetchRandomTerm])

  const discipline = term ? disciplines.find((d) => d.id === term.discipline) : null
  const favored = term ? isFavorite(term.id) : false

  const handleToggleFav = (e: React.MouseEvent) => {
    if (!term) return
    e.stopPropagation()
    toggleFavorite({
      id: term.id,
      name: term.name,
      translation: term.translation,
      discipline: term.discipline,
      essence: term.essence,
      tip: term.tip,
    })
  }

  const handleJump = () => {
    if (term && onHighlightTerm) {
      onHighlightTerm(term)
    }
  }

  return (
    <section className="py-8 sm:py-10 px-4 lg:px-6">
      <div className="max-w-[700px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FFF8ED] via-[#FFFAF2] to-[#FFF3E0] dark:from-[#2A2620] dark:via-[#26221C] dark:to-[#1F1B16] border border-warm-border p-5 sm:p-7 shadow-sm"
        >
          {/* 装饰背景 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-warm-accent/5 rounded-full -mr-16 -mt-16 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-warm-accent/5 rounded-full -ml-12 -mb-12 pointer-events-none" />

          <div className="relative">
            {/* 头部 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-warm-accent/15 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-warm-accent" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-warm-dark dark:text-warm-text">
                    今日推荐
                  </div>
                  <div className="text-xs text-warm-text">随机发现一个有趣概念</div>
                </div>
              </div>
              <button
                onClick={fetchRandomTerm}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-warm-accent bg-warm-accent/10 hover:bg-warm-accent/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                换一个
              </button>
            </div>

            {/* 内容 */}
            {isLoading && !term ? (
              <div className="py-8 text-center text-sm text-warm-text">加载中...</div>
            ) : error ? (
              <div className="py-8 text-center">
                <div className="text-sm text-warm-text mb-3">{error}</div>
                <button
                  onClick={fetchRandomTerm}
                  className="text-sm text-warm-accent hover:underline"
                >
                  重试
                </button>
              </div>
            ) : term ? (
              <motion.div
                key={term.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* 学科标签 */}
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: discipline?.color || '#8B7D6B' }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{ color: discipline?.color || '#8B7D6B' }}
                  >
                    {discipline?.name || term.discipline}
                  </span>
                  <div className="flex-1" />
                  <button
                    onClick={handleToggleFav}
                    className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${
                      favored
                        ? 'text-warm-accent bg-warm-accent/10'
                        : 'text-warm-text hover:text-warm-accent hover:bg-warm-accent/10'
                    }`}
                    title={favored ? '取消收藏' : '添加收藏'}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill={favored ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </button>
                </div>

                {/* 术语名称 */}
                <h3 className="text-2xl sm:text-3xl font-bold text-warm-dark dark:text-warm-text font-display mb-2">
                  {term.name}
                </h3>

                {/* 人话翻译 */}
                <div className="flex items-start gap-2 mb-3">
                  <ArrowRight className="w-4 h-4 text-warm-accent flex-shrink-0 mt-1" />
                  <span className="text-base font-medium text-warm-accent">{term.translation}</span>
                </div>

                {/* 本质解释 */}
                <p className="text-sm text-warm-text leading-relaxed mb-4 dark:text-warm-text">
                  {term.essence}
                </p>

                {/* 防忽悠提示 */}
                <div className="pt-3 border-t border-warm-border/60">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-disc-law flex-shrink-0 mt-0.5" />
                    <span className="text-[13px] text-disc-law italic leading-relaxed">
                      {term.tip}
                    </span>
                  </div>
                </div>

                {/* 跳转按钮 */}
                <div className="mt-4">
                  <button
                    onClick={handleJump}
                    className="text-xs text-warm-accent hover:underline font-medium"
                  >
                    在完整列表中查看 →
                  </button>
                </div>
              </motion.div>
            ) : null}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
