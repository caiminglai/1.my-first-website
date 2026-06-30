import { useState, useEffect } from 'react'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'

export interface SideNavItem {
  id: string
  label: string
  color?: string
}

interface SideNavProps {
  items: SideNavItem[]
  /** 默认主题色（用于按钮 hover/非 hover 状态） */
  themeColor?: string
  /** 额外的导航按钮（渲染在主列表和 TOP 之间） */
  extraItems?: { id: string; label: string; icon?: string }[]
}

export default function SideNav({ items, themeColor = '#D4853B', extraItems }: SideNavProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const { scrollTo } = useSmoothScroll()

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 400)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!isVisible) return null

  const colorFor = (item: SideNavItem) => item.color || themeColor

  return (
    <div className="fixed left-3 top-[180px] z-40 hidden lg:flex flex-col items-center gap-1">
      <div className="bg-white/95 dark:bg-[#252423]/95 backdrop-blur-md rounded-2xl border border-warm-border shadow-lg p-2 flex flex-col items-center gap-1">
        {items.map((item, index) => (
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
                color: hoveredIndex === index ? '#fff' : colorFor(item),
                backgroundColor: hoveredIndex === index ? colorFor(item) : colorFor(item) + '12',
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

        {extraItems && extraItems.length > 0 && (
          <>
            {extraItems.map((ei) => {
              const eiKey = `extra-${ei.id}`
              const eiIdx = items.length + extraItems.indexOf(ei)
              return (
                <div
                  key={eiKey}
                  className="relative"
                  onMouseEnter={() => setHoveredIndex(eiIdx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <button
                    onClick={() => scrollTo(ei.id)}
                    title={ei.label}
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-200 hover:scale-110"
                    style={{
                      color: hoveredIndex === eiIdx ? '#fff' : themeColor,
                      backgroundColor: hoveredIndex === eiIdx ? themeColor : themeColor + '12',
                    }}
                  >
                    {ei.icon || ei.label.slice(0, 2)}
                  </button>
                  {hoveredIndex === eiIdx && (
                    <div className="absolute left-12 top-1/2 -translate-y-1/2 ml-2 bg-warm-dark text-white rounded-lg px-3 py-2 shadow-xl whitespace-nowrap z-50">
                      <span className="text-sm font-medium">{ei.label}</span>
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-warm-dark rotate-45" />
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}

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
              color: hoveredIndex === 99 ? '#fff' : themeColor,
              backgroundColor: hoveredIndex === 99 ? themeColor : themeColor + '12',
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
