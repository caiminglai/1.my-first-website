import SideNav from './SideNav'
import type { SideNavItem } from './SideNav'

const navItems: SideNavItem[] = [
  { id: 'graph-section', label: '概念图谱', color: '#D4853B' },
  { id: 'compare-section', label: '概念对比', color: '#B8783A' },
  { id: 'scenario-section', label: '情景还原', color: '#A45D6A' },
]

export default function LeftSideNav() {
  return <SideNav items={navItems} />
}
