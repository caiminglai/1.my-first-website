import { Skeleton } from '@/components/ui/skeleton'

export function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="h-16 bg-warm-card border-b border-warm-divider" />
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-10 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
          <Skeleton className="h-4 w-2/3 mx-auto" />
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto px-4">
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
      <div className="max-w-[1200px] mx-auto px-4 py-10 space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-8 rounded-full" />
          ))}
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-[300px] w-full rounded-2xl" />
      </div>
      <div className="max-w-[1200px] mx-auto px-4 py-8 space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-36 rounded-2xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TechDeconstructionSkeleton() {
  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="h-16 bg-warm-card border-b border-warm-divider" />
      <div className="max-w-[1200px] mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="pt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="space-y-3 p-5 rounded-2xl border border-warm-divider bg-warm-card"
            >
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function CareerDeconstructionSkeleton() {
  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="h-16 bg-warm-card border-b border-warm-divider" />
      <div className="max-w-[1200px] mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-4 w-full" />
        <div className="pt-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-warm-divider bg-warm-card space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
                <Skeleton className="h-8 w-20 rounded-full ml-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function AntibodySkeleton() {
  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="h-16 bg-warm-card border-b border-warm-divider" />
      <div className="max-w-[1200px] mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-10 w-60" />
        <Skeleton className="h-4 w-full" />
        <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-warm-divider bg-warm-card space-y-3"
            >
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
