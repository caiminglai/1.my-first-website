import { useState, useEffect } from 'react'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'

const navItems = [
  { id: 'graph-section', label: '概念图谱', color: '#D4853B' },
  { id: 'compare-section', label: '概念对比', color: '#B8783A' },
  { id: 'scenario-section', label: '情景还原', color: '#A45D6A' },
]

export default function LeftSideNav() {
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const { scrollTo } = useSmoothScroll()

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 400)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed left-3 top-[180px] z-40 hidden lg:flex flex-col items-center gap-1">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-warm-border shadow-lg p-2 flex flex-col items-center gap-1">
        {navItems.map((item, index) => (
          <div
            key={item.id}
            className="relative"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <button
              onClick={() => scrollTo(item.id)}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-200 hover:scale-110"
              style={{
                color: hoveredIndex === index ? '#fff' : item.color,
                backgroundColor: hoveredIndex === index ? item.color : item.color + '12',
              }}
              title={item.label}
            >
              {item.label.slice(0, 2)}
            </button>

            {hoveredIndex === index && (
              <div className="absolute left-12 top-1/2 -translate-y-1/2 ml-2 bg-warm-dark text-white rounded-lg px-3 py-2 shadow-xl whitespace-nowrap z-50">
                <span className="text-sm font-medium">{item.label}</span>
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-warm-dark rotate-45" />
              </div>
            )}
          </div>
        ))}

        <div className="w-6 h-px bg-warm-border my-0.5" />

        <div
          className="relative"
          onMouseEnter={() => setHoveredIndex(99)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-200 hover:scale-110"
            style={{
              color: hoveredIndex === 99 ? '#fff' : '#D4853B',
              backgroundColor: hoveredIndex === 99 ? '#D4853B' : '#D4853B12',
            }}
            title="回到顶部"
          >
            TOP
          </button>
          {hoveredIndex === 99 && (
            <div className="absolute left-12 top-1/2 -translate-y-1/2 ml-2 bg-warm-dark text-white rounded-lg px-3 py-2 shadow-xl whitespace-nowrap z-50">
              <span className="text-sm font-medium">回到顶部</span>
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-warm-dark rotate-45" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
