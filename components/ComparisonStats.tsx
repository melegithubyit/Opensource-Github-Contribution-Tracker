"use client"
interface ApiData {
  profile: { login: string }
  totals: { stars: number; forks: number }
  prs: { opened: number; merged: number }
  prMergeRatio: number
  issues: { opened: number }
  languages: Record<string, number>
}
interface Props { a: ApiData; b: ApiData }
export default function ComparisonStats({ a, b }: Props) {
  const rows = [
    { label: "Stars", a: a.totals.stars, b: b.totals.stars },
    { label: "Forks", a: a.totals.forks, b: b.totals.forks },
    { label: "PRs Opened", a: a.prs.opened, b: b.prs.opened },
    { label: "PRs Merged", a: a.prs.merged, b: b.prs.merged },
    { label: "PR Merge %", a: a.prMergeRatio * 100, b: b.prMergeRatio * 100, fmt: (v: number) => v.toFixed(1) + "%" },
    { label: "Issues Opened", a: a.issues.opened, b: b.issues.opened },
    { label: "Languages (unique)", a: Object.keys(a.languages).length, b: Object.keys(b.languages).length },
  ]
  const winner = (x: number, y: number) => (x === y ? "" : x > y ? "text-green-600 dark:text-green-400" : "opacity-60")
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-muted-foreground">
            <th className="py-1 pr-4 font-medium">Metric</th>
            <th className="py-1 pr-4 font-medium">{a.profile.login}</th>
            <th className="py-1 pr-4 font-medium">{b.profile.login}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.label} className="border-t">
              <td className="py-1 pr-4">{r.label}</td>
              <td className={`py-1 pr-4 font-medium ${winner(r.a, r.b)}`}>{r.fmt ? r.fmt(r.a) : r.a.toLocaleString()}</td>
              <td className={`py-1 pr-4 font-medium ${winner(r.b, r.a)}`}>{r.fmt ? r.fmt(r.b) : r.b.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
