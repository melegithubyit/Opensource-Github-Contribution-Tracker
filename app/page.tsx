/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client"
import { useRef, useState } from "react"
// import html2canvas from "html2canvas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Github, Users, GitFork, Star, Share2, ExternalLink, Search, TrendingUp } from "lucide-react"
import TopReposChart from "@/components/TopReposChart"
import LanguageChart from "@/components/LanguageChart"
import ActivityFeed from "@/components/ActivityFeed"
import ContributionCalendar from "@/components/ContributionCalendar"
import PRMergeGauge from "@/components/PRMergeGauge"
import RateLimitIndicator from "@/components/RateLimitIndicator"
import ComparisonStats from "@/components/ComparisonStats"
import ThemeToggle from "@/components/ThemeToggle" 

interface GithubProfile {
  login: string
  name?: string
  avatar_url: string
  bio?: string | null
  followers: number
  following: number
  public_repos: number
  html_url: string
}

interface SlimRepo {
  id: number
  name: string
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string | null
  updated_at: string
}

interface PRStats {
  opened: number
  merged: number
  closed: number
}

interface SlimEvent {
  id: string
  type: string
  repo: string | null
  created_at: string
}

interface ApiData {
  profile: GithubProfile
  repos: SlimRepo[]
  totals: { stars: number; forks: number }
  languages: Record<string, number>
  prs: PRStats
  events: SlimEvent[]
  prMergeRatio: number
  contributionsCalendar: { total: number; days: { date: string; count: number }[] } | null
  issues: { opened: number; avgCloseHours?: number }
  badges: string[]
  rateLimit: { remaining: number; limit: number; reset: number } | null
  advancedLanguages?: Record<string, number>
  ecosystems: string[]
}

export default function Home() {
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [shareGenerating, setShareGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ApiData | null>(null)
  const [compareWith, setCompareWith] = useState("")
  const [compareData, setCompareData] = useState<ApiData | null>(null)
  const [advanced, setAdvanced] = useState(false)

  const shareRef = useRef<HTMLDivElement | null>(null)

  const fetchSingle = async (u: string, adv: boolean) => {
    const res = await fetch(`/api/github?username=${encodeURIComponent(u)}${adv ? "&advanced=1" : ""}`)
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || "Failed")
    return json as ApiData
  }

  const fetchData = async () => {
    const u = username.trim()
    if (!u) {
      setError("Please enter a username.")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const main = fetchSingle(u, advanced)
      const cmp = compareWith.trim() ? fetchSingle(compareWith.trim(), advanced) : Promise.resolve(null)
      const [d1, d2] = await Promise.all([main, cmp])
      setData(d1)
      setCompareData(d2 as any)
    } catch (e: any) {
      setError(e.message || "Unknown error.")
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  // const downloadShareImage = async () => {
  //   if (!shareRef.current || !data) return
  //   setShareGenerating(true)
  //   setError(null)
  //   try {
  //     const canvas = await html2canvas(shareRef.current, {
  //       backgroundColor: "#0f172a",
  //       scale: 2,
  //       useCORS: true,
  //     })
  //     const url = canvas.toDataURL("image/png")
  //     const a = document.createElement("a")
  //     a.href = url
  //     a.download = `github-stats-${data?.profile?.login || "user"}.png`
  //     a.click()
  //   } catch (e: any) {
  //     setError(e.message || "Failed to generate image.")
  //   } finally {
  //     setShareGenerating(false)
  //   }
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Github className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">GitHub Analytics</h1>
                <p className="text-xs text-muted-foreground">Open Source Contribution Tracker</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle /> {/* New */}
              <Badge variant="secondary" className="hidden sm:flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Powered by GitHub API
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Search / Inputs */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Discover GitHub Contributions</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get comprehensive insights into any GitHub developer&apos;s open source contributions, repository statistics,
              and coding activity.
            </p>
          </div>

          <Card className="max-w-2xl mx-auto shadow-lg">
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-10 h-12 text-base"
                    placeholder="Enter GitHub username (e.g., torvalds, gaearon)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !loading && fetchData()}
                    disabled={loading}
                  />
                </div>
                <Button
                  onClick={fetchData}
                  disabled={loading || !username.trim()}
                  size="lg"
                  className="h-12 px-8 font-semibold"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Analyze Profile
                    </>
                  )}
                </Button>
              </div>
              {/* New: comparison + advanced toggle */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Compare with (optional)"
                  value={compareWith}
                  onChange={(e) => setCompareWith(e.target.value)}
                  disabled={loading}
                />
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={advanced}
                    onChange={(e) => setAdvanced(e.target.checked)}
                    disabled={loading}
                  />
                  Advanced language scan
                </label>
              </div>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Rate limit indicator */}
        {data?.rateLimit && (
          <div className="mb-6">
            <RateLimitIndicator info={data.rateLimit} />
          </div>
        )}

        {data && (
          <div ref={shareRef} className="space-y-8">
            {/* Profile Header */}
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <Avatar className="h-24 w-24 ring-4 ring-background shadow-lg">
                    <AvatarImage src={data.profile.avatar_url || "/placeholder.svg"} alt={data.profile.login} />
                    <AvatarFallback className="text-2xl font-bold">
                      {data.profile.name?.[0] || data.profile.login[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-2xl font-bold">{data.profile.name || data.profile.login}</h3>
                      <p className="text-lg text-muted-foreground">@{data.profile.login}</p>
                    </div>

                    {data.profile.bio && (
                      <p className="text-muted-foreground leading-relaxed max-w-2xl">{data.profile.bio}</p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{data.profile.followers.toLocaleString()}</span>
                        <span className="text-muted-foreground">followers</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{data.profile.following.toLocaleString()}</span>
                        <span className="text-muted-foreground">following</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Github className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{data.profile.public_repos.toLocaleString()}</span>
                        <span className="text-muted-foreground">repositories</span>
                      </div>
                    </div>
                  </div>

                  <Button asChild variant="outline" className="shrink-0 bg-transparent">
                    <a href={data.profile.html_url} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on GitHub
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats Overview (add PR merge gauge + issues) */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              <Card className="shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Stars</p>
                      <p className="text-3xl font-bold">{data.totals.stars.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">Across all repositories</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                      <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Forks</p>
                      <p className="text-3xl font-bold">{data.totals.forks.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">Community contributions</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <GitFork className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">PRs Merged</p>
                      <p className="text-3xl font-bold">{data.prs.merged.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">Successful contributions</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">PR Merge Ratio</p>
                      <p className="text-3xl font-bold">{(data.prMergeRatio * 100).toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground mt-1">Merged / Opened</p>
                    </div>
                    <PRMergeGauge ratio={data.prMergeRatio} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Issues & Badges */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Issue Stats</CardTitle>
                  <CardDescription>Sampled recent issues (max 50)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    Issues Opened:{" "}
                    <span className="font-semibold">{data.issues.opened.toLocaleString()}</span>
                  </p>
                  <p>
                    Avg Close Time:{" "}
                    <span className="font-semibold">
                      {data.issues.avgCloseHours ? `${data.issues.avgCloseHours}h` : "n/a"}
                    </span>
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Badges</CardTitle>
                  <CardDescription>Automatic achievements</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {data.badges.length
                    ? data.badges.map((b) => (
                        <span
                          key={b}
                          className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium"
                        >
                          {b}
                        </span>
                      ))
                    : (
                        <p className="text-xs text-muted-foreground">No badges yet</p>
                      )}
                </CardContent>
              </Card>
            </div>

            {/* New: Charts Section (50/50) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Top Repositories</CardTitle>
                  <CardDescription>Most starred public repositories</CardDescription>
                </CardHeader>
                <CardContent>
                  <TopReposChart repos={data.repos} />
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Programming Languages</CardTitle>
                  <CardDescription>Language distribution across repositories</CardDescription>
                </CardHeader>
                <CardContent>
                  <LanguageChart data={data.languages} />
                </CardContent>
              </Card>
            </div>

            {/* Advanced Language Breakdown (full width) */}
            {advanced && data.advancedLanguages && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Advanced Language Breakdown</CardTitle>
                  <CardDescription>Aggregated bytes (top 15)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-xs grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {Object.entries(data.advancedLanguages)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 15)
                      .map(([k, v]) => (
                        <li key={k} className="flex justify-between gap-2">
                          <span className="truncate">{k}</span>
                          <span className="text-muted-foreground">{Math.round(v / 1024)} KB</span>
                        </li>
                      ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Activity & Calendar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="shadow-lg h-fit">
                <CardHeader>
                  <CardTitle>Contribution Calendar</CardTitle>
                  <CardDescription>Past year commits (requires token)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ContributionCalendar data={data.contributionsCalendar} />
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest public events (last 20)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ActivityFeed events={data.events} />
                </CardContent>
              </Card>
            </div>

            {/* Comparison Section */}
            {compareData && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>User Comparison</CardTitle>
                  <CardDescription>
                    {data.profile.login} vs {compareData.profile.login}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ComparisonStats a={data} b={compareData} />
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {data && (
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            {/* <Button
              onClick={downloadShareImage}
              disabled={shareGenerating}
              variant="outline"
              size="lg"
              className="font-semibold bg-transparent"
            >
              {shareGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download Share Image
                </>
              )}
            </Button> */}

            <Button
              asChild
              variant="outline"
              size="lg"
              className={`font-semibold ${shareGenerating ? "pointer-events-none opacity-60" : ""}`}
            >
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.profile.html_url)}`}
                target="_blank"
                rel="noreferrer"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share on LinkedIn
              </a>
            </Button>
          </div>
        )}

        {/* <Card className="mt-12 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              API Information & Setup
            </CardTitle>
            <CardDescription>Important notes about GitHub API usage and configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-1">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Rate Limits</h4>
                <p className="text-sm text-muted-foreground">
                  For higher API limits, create a GitHub token and add it to{" "}
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">.env.local</code> as{" "}
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">GITHUB_TOKEN=your_token</code>.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Language Detection</h4>
                <p className="text-sm text-muted-foreground">
                  Language chart uses a repository's primary language for speed. You can switch to the{" "}
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">/languages</code> endpoint per repo for more
                  detailed analysis.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Pull Request Stats</h4>
                <p className="text-sm text-muted-foreground">
                  PR statistics use GitHub's Search API totals; real-time limits may apply during high usage periods.
                </p>
              </div>
            </div>
          </CardContent>
        </Card> */}
      </main>

      <footer className="border-t bg-muted/30 mt-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>Built with Next.js, Tailwind CSS, and Recharts</p>
            <p className="mt-1">Powered by the GitHub API</p>
          </div>
        </div>
      </footer>
    </div>
  )
}