import { useDisciplines } from '@/hooks/useDisciplines'

interface FilterPillProps {
  discipline: string | 'all'
  isActive: boolean
  onClick: () => void
}

export default function FilterPill({ discipline, isActive, onClick }: FilterPillProps) {
  const { disciplines } = useDisciplines()

  const info =
    discipline === 'all'
      ? { name: '全部', color: '#D4853B' }
      : disciplines.find((d) => d.id === discipline)

  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap min-h-[44px] inline-flex items-center justify-center bg-warm-bg dark:bg-warm-card border border-warm-border text-warm-dark dark:text-warm-text"
      style={{
        backgroundColor: isActive ? info?.color : undefined,
        color: isActive ? '#FFFFFF' : undefined,
        border: isActive ? 'none' : undefined,
      }}
    >
      {info?.name || discipline}
    </button>
  )
}
