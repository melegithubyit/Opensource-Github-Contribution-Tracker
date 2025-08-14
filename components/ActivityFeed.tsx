"use client"
import { GitFork, Star, TrendingUp, Github, Code } from "lucide-react"

interface SlimEvent {
  id: string
  type: string
  repo: string | null
  created_at: string
}

interface ActivityFeedProps {
  events: SlimEvent[]
}

const typeLabel = (t: string) =>
  ({
    PushEvent: "Pushed commits",
    CreateEvent: "Created",
    ForkEvent: "Forked",
    WatchEvent: "Starred",
    IssuesEvent: "Issue activity",
    PullRequestEvent: "Pull request",
    PullRequestReviewEvent: "PR review",
    ReleaseEvent: "Release",
  }[t] || t)

const typeIcon = (t: string) => {
  switch (t) {
    case "ForkEvent":
      return <GitFork className="h-4 w-4 text-blue-500" />
    case "WatchEvent":
      return <Star className="h-4 w-4 text-yellow-500" />
    case "PullRequestEvent":
      return <TrendingUp className="h-4 w-4 text-green-500" />
    case "PushEvent":
      return <Code className="h-4 w-4 text-purple-500" />
    default:
      return <Github className="h-4 w-4 text-muted-foreground" />
  }
}

export default function ActivityFeed({ events }: ActivityFeedProps) {
  if (!events || events.length === 0)
    return <p className="text-sm text-muted-foreground">No recent public activity.</p>

  return (
    <ul className="space-y-3 max-h-80 overflow-y-auto pr-1">
      {events.map((e) => (
        <li key={e.id} className="flex items-center gap-3 text-sm border-b last:border-b-0 pb-3 last:pb-0">
          <div className="shrink-0">{typeIcon(e.type)}</div>
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{typeLabel(e.type)}</p>
            {e.repo && (
              <a
                href={`https://github.com/${e.repo}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary hover:underline truncate block"
              >
                {e.repo}
              </a>
            )}
          </div>
          <time
            className="text-[10px] text-muted-foreground shrink-0"
            title={new Date(e.created_at).toLocaleString()}
          >
            {new Date(e.created_at).toLocaleDateString()}
          </time>
        </li>
      ))}
    </ul>
  )
}
