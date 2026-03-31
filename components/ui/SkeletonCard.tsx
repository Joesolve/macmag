export function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <div className="card p-4 space-y-3 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-3 bg-gray-100 rounded w-full" />
      ))}
    </div>
  )
}
