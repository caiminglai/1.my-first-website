import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ConnectionCard from '../components/ConnectionCard'
import type { CrossDisciplineEntry } from '../api/types'

describe('ConnectionCard', () => {
  const mockEntry: CrossDisciplineEntry = {
    id: 'entropy',
    concept: '熵',
    names: [
      { discipline: '数学', name: '熵' },
      { discipline: '计算机', name: '信息熵' },
    ],
    summary: '衡量系统不确定性的数学量',
  }

  it('renders concept and discipline names', () => {
    render(<ConnectionCard entry={mockEntry} index={0} />)
    expect(screen.getAllByText('熵').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('信息熵')).toBeInTheDocument()
  })

  it('renders the summary text', () => {
    render(<ConnectionCard entry={mockEntry} index={0} />)
    expect(screen.getByText(/衡量系统不确定性的数学量/)).toBeInTheDocument()
  })
})
