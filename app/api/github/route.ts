/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from "next/server";

interface SlimRepo {
  id: number;
  name: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
}

interface SlimEvent {
  id: string;
  type: string;
  repo: string | null;
  created_at: string;
}

interface ContributionDay {
  date: string;
  count: number;
}
interface ContributionsCalendar {
  total: number;
  days: ContributionDay[];
}

// Helper: optional GitHub GraphQL call
async function ghGraphQL<T>(
  query: string,
  variables: Record<string, any>
): Promise<T | null> {
  if (!process.env.GITHUB_TOKEN) return null;
  const r = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      ...buildHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 3600 },
  });
  if (!r.ok) return null;
  try {
    return r.json() as any;
  } catch {
    return null;
  }
}

const buildHeaders = () => {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  if (process.env.GITHUB_TOKEN)
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return headers;
};

async function gh<T>(url: string): Promise<T> {
  const r = await fetch(url, {
    headers: buildHeaders(),
    next: { revalidate: 60 },
  });
  if (!r.ok) {
    // Attempt to parse rate limit information
    if (r.status === 403 && r.headers.get("x-ratelimit-remaining") === "0") {
      throw new Error(
        "GitHub rate limit exceeded. Add a token to .env.local as GITHUB_TOKEN."
      );
    }
    let detail = "";
    try {
      detail = await r.text();
    } catch {
      /* ignore */
    }
    throw new Error(
      `GitHub API error ${r.status}${detail ? `: ${detail}` : ""}`.slice(0, 400)
    );
  }
  return r.json();
}

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username");
  if (!username) {
    return NextResponse.json(
      { error: "username query is required" },
      { status: 400 }
    );
  }

  const advanced = req.nextUrl.searchParams.get("advanced") === "1";

  try {
    const profile = await gh<any>(
      `https://api.github.com/users/${encodeURIComponent(username)}`
    );
    const repos = await gh<any[]>(
      `https://api.github.com/users/${encodeURIComponent(
        username
      )}/repos?per_page=100&type=owner&sort=updated`
    );

    // Capture rate limit early
    const rateLimitInfo = await gh<any>(
      "https://api.github.com/rate_limit"
    ).catch(() => null);

    // New: recent public events (lightweight fields only)
    const eventsRaw = await gh<any[]>(
      `https://api.github.com/users/${encodeURIComponent(
        username
      )}/events/public?per_page=20`
    );
    const events: SlimEvent[] = eventsRaw.map((e) => ({
      id: e.id,
      type: e.type,
      repo: e.repo?.name || null,
      created_at: e.created_at,
    }));

    // Advanced language aggregation (bytes) if requested (limit concurrency & repos)
    let advancedLanguages: Record<string, number> | undefined;
    if (advanced) {
      const limited = repos.slice(0, 40); // cap to avoid heavy rate usage
      const chunks: any[][] = [];
      const concurrency = 5;
      for (let i = 0; i < limited.length; i += concurrency)
        chunks.push(limited.slice(i, i + concurrency));
      advancedLanguages = {};
      for (const batch of chunks) {
        await Promise.all(
          batch.map(async (r) => {
            try {
              const langs = await gh<Record<string, number>>(r.languages_url);
              Object.entries(langs).forEach(([k, v]) => {
                advancedLanguages![k] = (advancedLanguages![k] || 0) + v;
              });
            } catch {
              /* ignore single repo failure */
            }
          })
        );
      }
    }

    // Contribution calendar via GraphQL (last year)
    let contributionsCalendar: ContributionsCalendar | null = null;
    const calendarData = await ghGraphQL<any>(
      `
      query($login:String!){
        user(login:$login){
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                }
              }
            }
          }
        }
      }`,
      { login: username }
    );
    if (
      calendarData?.data?.user?.contributionsCollection?.contributionCalendar
    ) {
      const cal =
        calendarData.data.user.contributionsCollection.contributionCalendar;
      contributionsCalendar = {
        total: cal.totalContributions,
        days: cal.weeks.flatMap((w: any) =>
          w.contributionDays.map((d: any) => ({
            date: d.date,
            count: d.contributionCount,
          }))
        ),
      };
    }

    // Issues (sample up to 50 for avg close time)
    const issuesResult = await gh<any>(
      `https://api.github.com/search/issues?q=is:issue+author:${encodeURIComponent(
        username
      )}&per_page=50`
    ).catch(() => ({ total_count: 0, items: [] }));
    let avgCloseHours: number | undefined;
    if (issuesResult.items?.length) {
      const closed = issuesResult.items.filter((i: any) => i.closed_at);
      if (closed.length) {
        const sum = closed.reduce(
          (s: number, i: any) =>
            s +
            (new Date(i.closed_at).getTime() -
              new Date(i.created_at).getTime()) /
              36e5,
          0
        );
        avgCloseHours = Number((sum / closed.length).toFixed(2));
      }
    }

    const languageCounts: Record<string, number> = {};
    for (const repo of repos) {
      if (repo.language) {
        languageCounts[repo.language] =
          (languageCounts[repo.language] || 0) + 1;
      }
    }

    // Parallel PR stats
    const [prOpened, prMerged, prClosed] = await Promise.all([
      gh<any>(
        `https://api.github.com/search/issues?q=is:pr+author:${encodeURIComponent(
          username
        )}`
      ),
      gh<any>(
        `https://api.github.com/search/issues?q=is:pr+is:merged+author:${encodeURIComponent(
          username
        )}`
      ),
      gh<any>(
        `https://api.github.com/search/issues?q=is:pr+is:closed+author:${encodeURIComponent(
          username
        )}`
      ),
    ]);

    const totalStars = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
    const totalForks = repos.reduce((s, r) => s + (r.forks_count || 0), 0);

    const slimRepos: SlimRepo[] = repos.map((r) => ({
      id: r.id,
      name: r.name,
      html_url: r.html_url,
      stargazers_count: r.stargazers_count,
      forks_count: r.forks_count,
      language: r.language,
      updated_at: r.updated_at,
    }));

    const prMergeRatio =
      (prMerged.total_count && prOpened.total_count
        ? prMerged.total_count / prOpened.total_count
        : 0) || 0;

    // Simple badge system
    const badges: string[] = [];
    if (totalStars > 100) badges.push("Rising Star");
    if (totalStars > 1000) badges.push("Stellar");
    if (prMerged.total_count > 50) badges.push("PR Contributor");
    if (prMergeRatio > 0.6) badges.push("High Merge Ratio");
    if (contributionsCalendar && contributionsCalendar.total > 300)
      badges.push("Active Committer");

    // Ecosystems (rough heuristic from languages)
    const ecosystems: string[] = [];
    const lang = Object.keys(languageCounts);
    if (lang.includes("JavaScript") || lang.includes("TypeScript"))
      ecosystems.push("npm");
    if (lang.includes("Python")) ecosystems.push("PyPI");
    if (lang.includes("Java")) ecosystems.push("Maven");
    if (lang.includes("Go")) ecosystems.push("Go Modules");
    if (lang.includes("Rust")) ecosystems.push("Crates.io");
    if (lang.includes("C#")) ecosystems.push("NuGet");

    return NextResponse.json({
      profile,
      repos: slimRepos,
      totals: { stars: totalStars, forks: totalForks },
      languages: languageCounts,
      prs: {
        opened: prOpened.total_count,
        merged: prMerged.total_count,
        closed: prClosed.total_count,
      },
      events,
      prMergeRatio, // New
      contributionsCalendar, // New
      issues: {
        opened: issuesResult.total_count,
        avgCloseHours,
      },
      badges, // New
      rateLimit: rateLimitInfo
        ? {
            remaining: rateLimitInfo.resources.core.remaining,
            limit: rateLimitInfo.resources.core.limit,
            reset: rateLimitInfo.resources.core.reset,
          }
        : null,
      advancedLanguages, // New (bytes)
      ecosystems, // New
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Internal error" },
      { status: 500 }
    );
  }
}
