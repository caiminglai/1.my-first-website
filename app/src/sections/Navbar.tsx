import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router'

import { useDisciplines } from '@/hooks/useDisciplines'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'
import { useTheme } from '@/hooks/useTheme'
import { useFavorites } from '@/hooks/useFavorites'

interface NavbarProps {
  onSearch: (query: string) => void
  onRandom: () => void
  onFilterDiscipline: (discipline: string | 'all') => void
  activeFilter?: string
}

export default function Navbar({ onSearch, onRandom, onFilterDiscipline }: NavbarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [favoritesOpen, setFavoritesOpen] = useState(false)
  const navigate = useNavigate()
  const { scrollTo } = useSmoothScroll()
  const { disciplines } = useDisciplines()
  const { isDark, toggleTheme } = useTheme()
  const { favorites, favoritesCount, removeFavorite, clearFavorites } = useFavorites()
  const favoritesPanelRef = useRef<HTMLDivElement>(null)
  const favoritesBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!favoritesOpen) return
      const target = e.target as Node
      if (
        favoritesPanelRef.current &&
        !favoritesPanelRef.current.contains(target) &&
        favoritesBtnRef.current &&
        !favoritesBtnRef.current.contains(target)
      ) {
        setFavoritesOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [favoritesOpen])

  const getDisciplineColor = (id: string) => {
    const discipline = disciplines.find((d) => d.id === id)
    return discipline?.color || '#8B7D6B'
  }

  const getDisciplineName = (id: string) => {
    const discipline = disciplines.find((d) => d.id === id)
    return discipline?.name || id
  }

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen)
    if (isSearchOpen) {
      setSearchQuery('')
      onSearch('')
    }
  }

  const handleSearchInput = (value: string) => {
    setSearchQuery(value)
    onSearch(value)
  }

  const handleFavoriteClick = (fav: { id: string; discipline: string }) => {
    onFilterDiscipline(fav.discipline)
    scrollTo(`category-${fav.discipline}`)
    setFavoritesOpen(false)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-warm-bg/80 backdrop-blur-xl border-b border-warm-border">
      <div className="max-w-[1200px] mx-auto h-full flex items-center justify-between px-4 lg:px-6">
        <button
          onClick={() => {
            onFilterDiscipline('all')
            navigate('/')
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="flex items-center gap-2 flex-shrink-0"
        >
          <span className="text-xl">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-warm-dark dark:text-warm-text"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </span>
          <span className="text-xl font-bold text-warm-dark dark:text-warm-text font-display">
            同物异名
          </span>
        </button>

        <div className="flex items-center gap-1 sm:gap-2 relative">
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="overflow-hidden flex-1 max-w-[250px] sm:max-w-none"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  placeholder="搜索术语..."
                  autoFocus
                  className="w-full h-11 px-3 rounded-lg bg-warm-card dark:bg-warm-card border border-warm-border text-warm-dark dark:text-warm-text text-sm focus:outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/15"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleSearchToggle}
            className="w-11 h-11 flex items-center justify-center rounded-lg text-warm-text dark:text-warm-text hover:text-warm-accent hover:bg-warm-accent/10 transition-colors"
            title="搜索"
          >
            {isSearchOpen ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            )}
          </button>

          <button
            onClick={onRandom}
            className="w-11 h-11 flex items-center justify-center rounded-lg text-warm-text dark:text-warm-text hover:text-warm-accent hover:bg-warm-accent/10 transition-colors"
            title="随机词条"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="3" />
              <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="16" cy="8" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="8" cy="16" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="16" cy="16" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
            </svg>
          </button>

          <button
            onClick={() => navigate('/deconstruction')}
            className="w-11 h-11 hidden sm:flex items-center justify-center rounded-lg text-warm-text dark:text-warm-text hover:text-warm-accent hover:bg-warm-accent/10 transition-colors"
            title="职业解构"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </button>

          <button
            onClick={() => navigate('/tech')}
            className="w-11 h-11 hidden sm:flex items-center justify-center rounded-lg text-warm-text dark:text-warm-text hover:text-warm-accent hover:bg-warm-accent/10 transition-colors"
            title="岗位拆解"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 3h12l4 6-10 13L2 9z" />
              <path d="M12 22V9" />
              <path d="m2 9 10 13L22 9" />
              <path d="M6 3l6 6 6-6" />
            </svg>
          </button>

          <button
            ref={favoritesBtnRef}
            onClick={() => setFavoritesOpen(!favoritesOpen)}
            className="w-11 h-11 flex items-center justify-center rounded-lg text-warm-text dark:text-warm-text hover:text-warm-accent hover:bg-warm-accent/10 transition-colors relative"
            title="我的收藏"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={favoritesCount > 0 ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            {favoritesCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-warm-accent text-white text-[10px] font-bold flex items-center justify-center">
                {favoritesCount > 99 ? '99+' : favoritesCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {favoritesOpen && (
              <motion.div
                ref={favoritesPanelRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-14 w-[320px] sm:w-[360px] bg-warm-card dark:bg-warm-card rounded-xl shadow-lg border border-warm-border overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-warm-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      stroke="none"
                      className="text-warm-accent"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span className="text-sm font-semibold text-warm-dark dark:text-warm-text">
                      我的收藏
                    </span>
                    <span className="text-xs text-warm-text">({favoritesCount})</span>
                  </div>
                  {favoritesCount > 0 && (
                    <button
                      onClick={clearFavorites}
                      className="text-xs text-warm-text hover:text-warm-accent transition-colors"
                    >
                      清空
                    </button>
                  )}
                </div>

                <div className="max-h-[360px] overflow-y-auto">
                  {favorites.length === 0 ? (
                    <div className="px-4 py-10 text-center text-sm text-warm-text">
                      <div className="mb-2 text-3xl opacity-50">☆</div>
                      暂无收藏，点击词条右上角 ☆ 添加
                    </div>
                  ) : (
                    <div>
                      {favorites.map((fav) => (
                        <div
                          key={fav.id}
                          className="flex items-start gap-2 px-4 py-3 border-b border-warm-border last:border-b-0 hover:bg-warm-bg/50 dark:hover:bg-warm-bg/30 transition-colors cursor-pointer group"
                          onClick={() => handleFavoriteClick(fav)}
                        >
                          <span
                            className="px-2 py-0.5 text-[11px] rounded-full flex-shrink-0 mt-0.5"
                            style={{
                              backgroundColor: `${getDisciplineColor(fav.discipline)}20`,
                              color: getDisciplineColor(fav.discipline),
                            }}
                          >
                            {getDisciplineName(fav.discipline)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-warm-dark dark:text-warm-text truncate">
                              {fav.name}
                            </div>
                            <div className="text-xs text-warm-text truncate mt-0.5">
                              {fav.translation}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              removeFavorite(fav.id)
                            }}
                            className="opacity-0 group-hover:opacity-100 text-warm-text hover:text-warm-accent transition-opacity flex-shrink-0"
                            title="移除"
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={toggleTheme}
            className="w-11 h-11 flex items-center justify-center rounded-lg text-warm-text dark:text-warm-text hover:text-warm-accent hover:bg-warm-accent/10 transition-colors"
            title={isDark ? '切换到浅色' : '切换到深色'}
          >
            {isDark ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  )
}
