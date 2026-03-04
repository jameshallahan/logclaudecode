export default function WorkoutCard({ workout, loading = false }) {
  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-xl p-5 animate-pulse">
        <div className="h-4 bg-border rounded w-1/2 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-border rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (!workout) return null

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Today's Session
        </h3>
        <span className="text-xs text-text-muted">{workout.duration_minutes} min</span>
      </div>

      <h2 className="text-lg font-semibold text-text mb-4">{workout.session_type}</h2>

      <div className="space-y-3">
        {workout.exercises?.map((ex, i) => (
          <div key={i} className="flex items-start justify-between py-2 border-b border-border last:border-0">
            <div className="flex-1">
              <p className="text-sm font-semibold text-text">{ex.name}</p>
              {ex.notes && <p className="text-xs text-text-muted mt-0.5">{ex.notes}</p>}
            </div>
            <div className="text-right ml-4 shrink-0">
              <p className="text-sm text-text">
                {ex.sets} x {ex.reps}
              </p>
              {ex.target_weight_kg > 0 && (
                <p className="text-xs text-text-muted">{ex.target_weight_kg}kg</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {workout.notes && (
        <p className="text-xs text-text-muted mt-4 pt-3 border-t border-border">
          {workout.notes}
        </p>
      )}
    </div>
  )
}
