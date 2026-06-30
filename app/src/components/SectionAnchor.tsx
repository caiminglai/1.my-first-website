interface SectionAnchorProps {
  id: string
  children: React.ReactNode
}

export default function SectionAnchor({ id, children }: SectionAnchorProps) {
  return <div id={id}>{children}</div>
}
