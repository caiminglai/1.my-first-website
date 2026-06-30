import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
}

export default function StarRating({ rating }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${s <= rating ? 'text-warm-accent fill-warm-accent' : 'text-warm-border'}`}
        />
      ))}
    </div>
  )
}
