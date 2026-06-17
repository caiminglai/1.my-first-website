import { useState, useEffect, useCallback } from 'react'

const FAVORITES_KEY = 'term_favorites'
const MAX_FAVORITES = 100

interface FavoriteItem {
  id: string
  name: string
  translation: string
  discipline: string
  essence?: string
  tip?: string
}

function readFavorites(): FavoriteItem[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
    return []
  } catch {
    return []
  }
}

function writeFavorites(items: FavoriteItem[]) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(items))
  } catch {
    // 忽略存储失败
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => readFavorites())

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === FAVORITES_KEY) {
        setFavorites(readFavorites())
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const isFavorite = useCallback(
    (id: string) => {
      return favorites.some((f) => f.id === id)
    },
    [favorites],
  )

  const addFavorite = useCallback((item: FavoriteItem) => {
    setFavorites((prev) => {
      if (prev.some((f) => f.id === item.id)) return prev
      const next = [item, ...prev].slice(0, MAX_FAVORITES)
      writeFavorites(next)
      return next
    })
  }, [])

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.filter((f) => f.id !== id)
      writeFavorites(next)
      return next
    })
  }, [])

  const toggleFavorite = useCallback(
    (item: FavoriteItem) => {
      const exists = favorites.some((f) => f.id === item.id)
      if (exists) {
        removeFavorite(item.id)
      } else {
        addFavorite(item)
      }
    },
    [favorites, addFavorite, removeFavorite],
  )

  const clearFavorites = useCallback(() => {
    setFavorites([])
    try {
      localStorage.removeItem(FAVORITES_KEY)
    } catch {
      // 忽略
    }
  }, [])

  return {
    favorites,
    favoritesCount: favorites.length,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearFavorites,
  }
}
