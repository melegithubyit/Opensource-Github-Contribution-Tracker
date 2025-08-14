"use client"
interface CalendarProps {
  data: { total: number; days: { date: string; count: number }[] } | null
}

export default function ContributionCalendar({ data }: CalendarProps) {
  if (!data) return <p className="text-xs text-muted-foreground">No calendar (token required or unavailable).</p>
  if (!data.days.length) return <p className="text-xs text-muted-foreground">No contributions.</p>

  // Take last 28 * 5 (~140) days for compact display
  const sorted = [...data.days].sort((a, b) => a.date.localeCompare(b.date)).slice(-140)
  const max = Math.max(...sorted.map((d) => d.count), 1)
  return (
    <div>
      <div className="grid grid-cols-28 gap-[2px]">
        {sorted.map((d) => {
          const lvl = d.count === 0 ? 0 : Math.ceil((d.count / max) * 4)
          const colors = [
            "bg-muted",
            "bg-emerald-200 dark:bg-emerald-900/40",
            "bg-emerald-300 dark:bg-emerald-800/60",
            "bg-emerald-400 dark:bg-emerald-700/70",
            "bg-emerald-500 dark:bg-emerald-600/80",
          ]
          return (
            <div
              key={d.date}
              title={`${d.date}: ${d.count} contributions`}
              className={`w-3 h-3 rounded-sm ${colors[lvl]}`}
            />
          )
        })}
      </div>
      <p className="text-[10px] text-muted-foreground mt-2">
        Total (year): {data.total.toLocaleString()}
      </p>
    </div>
  )
}
