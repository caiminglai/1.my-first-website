import { useContext } from 'react'
import { FavoritesContext } from '@/contexts/FavoritesProvider'
import type { FavoriteItem } from '@/contexts/FavoritesProvider'

export type { FavoriteItem }

/**
 * 消费收藏夹上下文。
 * 必须在 <FavoritesProvider> 内使用。
 */
export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) {
    throw new Error('useFavorites must be used within a <FavoritesProvider>')
  }
  return ctx
}
