import { useState, useEffect } from 'react'
import { getStats } from '../api/services'

interface StatsData {
  totalTerms: number
  mainTerms: number
  subjectTerms: number
  hotTerms: number
  totalLinks: number
  totalComparisons: number
  totalScenarios: number
  byDiscipline: Record<string, number>
}

export function useStats() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getStats()
      .then((res: any) => {
        if (!cancelled) {
          setStats(res.data || res)
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error('Failed to fetch stats:', err)
        if (!cancelled) {
          setError('获取统计数据失败')
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { stats, loading, error }
}
