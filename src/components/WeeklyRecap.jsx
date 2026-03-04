export default function WeeklyRecap({ recap, loading = false }) {
  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-xl p-5 animate-pulse">
        <div className="h-4 bg-border rounded w-1/3 mb-3" />
        <div className="space-y-2">
          <div className="h-3 bg-border rounded w-full" />
          <div className="h-3 bg-border rounded w-5/6" />
          <div className="h-3 bg-border rounded w-3/4" />
        </div>
      </div>
    )
  }

  if (!recap) return null

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
        Weekly Recap
      </h3>
      <p className="text-sm text-text leading-relaxed whitespace-pre-wrap">{recap}</p>
    </div>
  )
}
