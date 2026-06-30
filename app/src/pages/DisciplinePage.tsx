import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import Navbar from '@/sections/Navbar'
import Footer from '@/sections/Footer'
import TermCard from '@/components/TermCard'
import ConceptGraph from '@/components/ConceptGraph'
import { getDisciplines, getTerms } from '@/api/services'
import type { DisciplineData } from '@/api/services'
import type { APITerm } from '@/api/types'

export default function DisciplinePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [discipline, setDiscipline] = useState<DisciplineData | null>(null)
  const [terms, setTerms] = useState<APITerm[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!id) return
      setLoading(true)
      try {
        // 加载学科列表
        const disciplines = await getDisciplines()
        const disc = disciplines.find((d) => d.id === id)
        if (!cancelled) setDiscipline(disc ? { ...disc, description: disc.description || '' } : null)

        // 加载该学科下的词条（使用统一 API 服务）
        const termsData = await getTerms(1, 500, disc?.name || id)
        if (!cancelled) {
          const list: APITerm[] = Array.isArray(termsData)
            ? termsData
            : termsData?.terms || []
          setTerms(list)
        }
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : '加载失败')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id])

  useEffect(() => {
    if (discipline) {
      document.title = `${discipline.name} - 同物异名`
    }
  }, [discipline])

  return (
    <div className="min-h-screen bg-warm-bg">
      <Navbar onSearch={() => {}} onRandom={() => {}} onFilterDiscipline={() => {}} />

      <main className="pt-20 pb-10">
        {loading ? (
          <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-20 text-center text-warm-text">
            加载中...
          </div>
        ) : error ? (
          <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-20 text-center">
            <p className="text-warm-text mb-4">加载失败: {error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 rounded-lg bg-disc-econ text-white font-medium hover:bg-disc-econ/90 transition-colors"
            >
              返回首页
            </button>
          </div>
        ) : !discipline ? (
          <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-20 text-center">
            <h1 className="text-2xl font-bold text-warm-dark mb-4 font-display">学科未找到</h1>
            <p className="text-warm-text mb-6">你访问的学科分类不存在。</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 rounded-lg bg-disc-econ text-white font-medium hover:bg-disc-econ/90 transition-colors"
            >
              返回首页
            </button>
          </div>
        ) : (
          <div className="max-w-[1200px] mx-auto px-4 lg:px-6">
            {/* 学科标题 */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-warm-dark font-display flex items-center gap-3">
                <span className="w-1.5 h-10 rounded-full" style={{ backgroundColor: discipline.color || '#6B7D5E' }} />
                {discipline.name}
              </h1>
              {discipline.description && (
                <p className="mt-3 text-warm-text pl-5">{discipline.description}</p>
              )}
              <p className="mt-2 text-sm text-warm-text/70 pl-5">共 {terms.length} 个词条</p>
            </div>

            {/* 学科专属概念关系图谱 */}
            <section className="mb-10">
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-xl font-bold text-warm-dark font-display flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: discipline.color || '#6B7D5E' }} />
                  「{discipline.name}」的概念关系图谱
                </h2>
                <span className="text-xs text-warm-text/70">只显示该学科内部的词条与关系</span>
              </div>
              <ConceptGraph discipline={id} subtitle={`${discipline.name} 内关系：`} />
            </section>

            {/* 词条列表 */}
            {terms.length === 0 ? (
              <div className="text-center py-16 text-warm-text">
                <p>该学科下暂时没有词条。</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {terms.map((term, i) => (
                  <TermCard key={term.id} entry={term} index={i} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
