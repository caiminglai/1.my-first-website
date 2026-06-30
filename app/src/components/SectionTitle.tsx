import { motion } from 'framer-motion'

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

interface SectionTitleProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  subtitle: string
}

export default function SectionTitle({ icon: Icon, title, subtitle }: SectionTitleProps) {
  return (
    <motion.div variants={itemVariants} className="text-center mb-8">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-warm-accent/10 text-warm-accent text-sm font-medium mb-3">
        <Icon className="w-4 h-4" />
        {title}
      </div>
      <p className="text-warm-text text-base">{subtitle}</p>
    </motion.div>
  )
}
