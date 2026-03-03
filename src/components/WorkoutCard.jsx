export default function WorkoutCard({ workout, loading = false }) {
  if (loading) {
    return (
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5 animate-pulse">
        <div className="h-4 bg-[#2A2A2A] rounded w-1/2 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-[#2A2A2A] rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (!workout) return null

  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-[#888888] uppercase tracking-wider">
          Today's Session
        </h3>
        <span className="text-xs text-[#888888]">{workout.duration_minutes} min</span>
      </div>

      <h2 className="text-lg font-semibold text-[#F0F0F0] mb-4">{workout.session_type}</h2>

      <div className="space-y-3">
        {workout.exercises?.map((ex, i) => (
          <div key={i} className="flex items-start justify-between py-2 border-b border-[#2A2A2A] last:border-0">
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#F0F0F0]">{ex.name}</p>
              {ex.notes && <p className="text-xs text-[#888888] mt-0.5">{ex.notes}</p>}
            </div>
            <div className="text-right ml-4 shrink-0">
              <p className="text-sm text-[#F0F0F0]">
                {ex.sets} x {ex.reps}
              </p>
              {ex.target_weight_kg > 0 && (
                <p className="text-xs text-[#888888]">{ex.target_weight_kg}kg</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {workout.notes && (
        <p className="text-xs text-[#888888] mt-4 pt-3 border-t border-[#2A2A2A]">
          {workout.notes}
        </p>
      )}
    </div>
  )
}
