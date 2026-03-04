const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

/**
 * WeekDots — 7-dot progress indicator for current week (Mon–Sun).
 *
 * Props:
 * - days: array of 7 booleans — true = logged, false = not logged.
 *         Index 0 = Monday, index 6 = Sunday.
 * - todayIndex: 0-6 index of today (Monday=0, Sunday=6).
 */
export default function WeekDots({ days = [], todayIndex = -1 }) {
  return (
    <div className="flex items-center justify-between">
      {DAY_LABELS.map((label, i) => {
        const logged = days[i]
        const isToday = i === todayIndex
        const isFuture = i > todayIndex

        return (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <span className={`text-[11px] font-semibold ${isToday ? 'text-text' : 'text-text-muted'}`}>
              {label}
            </span>
            <div
              className={`rounded-full transition-colors ${
                isToday ? 'w-3.5 h-3.5' : 'w-3 h-3'
              } ${
                logged
                  ? 'bg-accent'
                  : isFuture
                    ? 'bg-border'
                    : isToday
                      ? 'border-2 border-accent bg-transparent'
                      : 'border-2 border-border bg-transparent'
              }`}
            />
          </div>
        )
      })}
    </div>
  )
}
