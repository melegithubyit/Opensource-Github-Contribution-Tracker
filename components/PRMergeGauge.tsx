"use client"


interface GaugeProps { ratio: number }
export default function PRMergeGauge({ ratio }: GaugeProps) {
  const pct = Math.min(100, Math.max(0, ratio * 100))
  return (
    <div className="relative w-12 h-12">
      <svg viewBox="0 0 36 36" className="w-12 h-12">
        <path
          d="M18 2 a16 16 0 0 1 0 32 a16 16 0 0 1 0 -32"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-muted/30"
        />
        <path
          d="M18 2 a16 16 0 0 1 0 32 a16 16 0 0 1 0 -32"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="4"
          strokeDasharray={`${(pct / 100) * 100}, 100`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-medium">{pct.toFixed(0)}%</span>
      </div>
    </div>
  )
}
