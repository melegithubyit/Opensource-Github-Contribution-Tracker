"use client"

interface RateLimitInfo {
  remaining: number
  limit: number
  reset: number
}

export default function RateLimitIndicator({ info }: { info: RateLimitInfo }) {
  const resetDate = new Date(info.reset * 1000)
  const time = resetDate.toISOString().slice(11, 16) + " UTC" // HH:MM UTC (stable)
  return (
    <div className="w-full rounded-md border p-3 text-xs flex flex-wrap gap-2 items-center">
      <span className="font-medium">GitHub API requests are rate limited.</span>
      <span>Resets at {time}.</span>
    </div>
  )
}
