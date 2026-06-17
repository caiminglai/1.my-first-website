import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { useDisciplines } from '@/hooks/useDisciplines'
import { useTerms } from '@/hooks/useTerms'
import Navbar from '@/sections/Navbar'
import HeroSection from '@/sections/HeroSection'
import SearchSection from '@/sections/SearchSection'
import Footer from '@/sections/Footer'
import ConceptGraph from '@/components/ConceptGraph'
import ConceptCompareTool from '@/components/ConceptCompareTool'
import ScenarioReveal from '@/components/ScenarioReveal'
import DisciplineBrowser from '@/components/DisciplineBrowser'
import LeftSideNav from '@/components/LeftSideNav'
import AIAssistant from '@/components/AIAssistant'
import TodayRecommend from '@/components/TodayRecommend'
import { HomeSkeleton } from '@/components/LoadingSkeletons'

interface SearchSuggestion {
  id: string
  name: string
  translation: string
  discipline: string
}

export default function Home() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<string | 'all'>('all')

  // 使用动态学科数据
  const { disciplines, loading: disciplinesLoading } = useDisciplines()
  // 使用动态词条数据
  const { terms, loading: termsLoading } = useTerms()

  // 初始加载判断（注意：不能在 hooks 前面 return，必须让所有 hooks 被调用一次）
  const isInitialLoading = termsLoading && disciplinesLoading && terms.length === 0

  // 搜索处理函数 - 按回车时，若当前搜索命中某个学科，跳转到该学科页
  const handleSearch = useCallback(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return
    const matched = terms.find(
      (t) => t.name.toLowerCase().includes(query) || t.translation.toLowerCase().includes(query),
    )
    if (matched) {
      navigate(`/discipline/${matched.discipline}`)
    }
  }, [searchQuery, terms, navigate])

  // 处理选择搜索建议
  const handleSelectSuggestion = useCallback(
    (suggestion: SearchSuggestion) => {
      setActiveFilter(suggestion.discipline)
      navigate(`/discipline/${suggestion.discipline}`)
    },
    [navigate],
  )

  // 随机词条：跳到一个随机学科页
  const handleRandom = useCallback(() => {
    const available = disciplines.filter((d) => d.id !== 'all')
    if (available.length === 0) return
    const random = available[Math.floor(Math.random() * available.length)]
    navigate(`/discipline/${random.id}`)
  }, [disciplines, navigate])

  // 分类筛选
  const handleFilterChange = useCallback((filter: string | 'all') => {
    setActiveFilter(filter)
    if (filter === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [])

  // 图谱节点点击：跳到该节点所属学科页
  const handleGraphNodeClick = useCallback(
    (nodeId: string) => {
      const nodeDiscipline = terms.find((t) => t.id === nodeId)?.discipline
      if (nodeDiscipline) {
        navigate(`/discipline/${nodeDiscipline}`)
      }
    },
    [navigate, terms],
  )

  // 所有 hooks 调用完成后，按条件返回骨架屏
  if (isInitialLoading) {
    return <HomeSkeleton />
  }

  return (
    <div className="min-h-screen bg-warm-bg dark:bg-warm-bg">
      <Navbar
        onSearch={setSearchQuery}
        onRandom={handleRandom}
        onFilterDiscipline={handleFilterChange}
      />

      <HeroSection />

      <TodayRecommend
        onHighlightTerm={(t) => {
          setActiveFilter(t.discipline)
          navigate(`/discipline/${t.discipline}`)
        }}
      />

      <SearchSection
        query={searchQuery}
        onQueryChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        onSelectSuggestion={handleSelectSuggestion}
      />

      {/* 学科浏览器：入口网格 */}
      <DisciplineBrowser />

      {/* ====== 模块1：D3概念图谱（杀手锏）====== */}
      <section id="graph-section" className="py-8 sm:py-10 px-4 lg:px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-[28px] font-bold text-warm-dark font-display flex items-center gap-3">
              <span className="w-1 h-8 rounded-full bg-warm-accent" />
              概念关系图谱
            </h2>
            <p className="text-sm sm:text-[15px] text-warm-text mt-2 max-w-[700px] ml-4">
              拖动节点探索概念之间的隐藏连接。同一个本质在不同学科中如何换名字？点击热门节点（大圆）查看详情。
            </p>
          </div>
          <ConceptGraph onNodeClick={handleGraphNodeClick} />
        </div>
      </section>

      {/* ====== 模块3：概念对比器 ====== */}
      <section id="compare-section" className="py-8 sm:py-10 px-4 lg:px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-[28px] font-bold text-warm-dark font-display flex items-center gap-3">
              <span className="w-1 h-8 rounded-full bg-disc-econ" />
              这些长得像的东西，到底什么区别
            </h2>
            <p className="text-sm sm:text-[15px] text-warm-text mt-2 max-w-[700px] ml-4">
              左右对比，一眼看穿相似概念的本质差异。
            </p>
          </div>
          <ConceptCompareTool />
        </div>
      </section>

      {/* ====== 模块4：情景还原 ====== */}
      <section id="scenario-section" className="py-8 sm:py-10 px-4 lg:px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-[28px] font-bold text-warm-dark font-display flex items-center gap-3">
              <span className="w-1 h-8 rounded-full bg-disc-med" />
              你是被这样忽悠的
            </h2>
            <p className="text-sm sm:text-[15px] text-warm-text mt-2 max-w-[700px] ml-4">
              还原真实场景，看专业人士如何用术语包装简单的事实。
            </p>
          </div>
          <ScenarioReveal />
        </div>
      </section>

      <Footer />

      {/* 左侧浮动导航 - 屏幕垂直居中 */}
      <LeftSideNav />

      {/* AI问答助手 */}
      <AIAssistant />
    </div>
  )
}
