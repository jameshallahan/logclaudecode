export default function WeeklyRecap({ recap, loading = false }) {
  if (loading) {
    return (
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5 animate-pulse">
        <div className="h-4 bg-[#2A2A2A] rounded w-1/3 mb-3" />
        <div className="space-y-2">
          <div className="h-3 bg-[#2A2A2A] rounded w-full" />
          <div className="h-3 bg-[#2A2A2A] rounded w-5/6" />
          <div className="h-3 bg-[#2A2A2A] rounded w-3/4" />
        </div>
      </div>
    )
  }

  if (!recap) return null

  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5">
      <h3 className="text-xs font-semibold text-[#888888] uppercase tracking-wider mb-3">
        Weekly Recap
      </h3>
      <p className="text-sm text-[#F0F0F0] leading-relaxed whitespace-pre-wrap">{recap}</p>
    </div>
  )
}
