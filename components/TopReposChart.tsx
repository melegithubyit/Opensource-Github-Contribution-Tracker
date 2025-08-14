/* eslint-disable @typescript-eslint/no-explicit-any */

"use client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Star, GitFork, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SlimRepo {
  id: number
  name: string
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string | null
  updated_at: string
}

interface TopReposChartProps {
  repos: SlimRepo[]
}

export default function TopReposChart({ repos }: TopReposChartProps) {
  // Sort by stars and take top 8 for better visualization
  const topRepos = repos
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 8)
    .map((repo) => ({
      name: repo.name.length > 15 ? repo.name.substring(0, 15) + "..." : repo.name,
      fullName: repo.name,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
      url: repo.html_url,
    }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm mb-2">{data.fullName}</p>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <Star className="h-3 w-3 text-yellow-500" />
              <span>{data.stars.toLocaleString()} stars</span>
            </div>
            <div className="flex items-center gap-2">
              <GitFork className="h-3 w-3 text-blue-500" />
              <span>{data.forks.toLocaleString()} forks</span>
            </div>
            {data.language && <div className="text-muted-foreground">Language: {data.language}</div>}
          </div>
        </div>
      )
    }
    return null
  }

  if (topRepos.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No repositories found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topRepos} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="stars"
              fill="hsl(var(--chart-1))"
              radius={[4, 4, 0, 0]}
              className="hover:opacity-80 transition-opacity"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Repository Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
        {topRepos.slice(0, 6).map((repo, index) => (
          <Button key={index} variant="ghost" size="sm" asChild className="justify-start h-auto p-2 text-left">
            <a href={repo.url} target="_blank" rel="noreferrer">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{repo.fullName}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {repo.stars}
                    </span>
                    {repo.language && <span className="truncate">{repo.language}</span>}
                  </div>
                </div>
                <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
              </div>
            </a>
          </Button>
        ))}
      </div>
    </div>
  )
}
