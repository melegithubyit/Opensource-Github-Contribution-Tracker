/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Code } from "lucide-react"

interface LanguageChartProps {
  data: Record<string, number>
}

// Modern color palette for programming languages
const LANGUAGE_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#8b5cf6", // purple
  "#06b6d4", // cyan
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
]

export default function LanguageChart({ data }: LanguageChartProps) {
  // Convert data to chart format and sort by usage
  const chartData = Object.entries(data)
    .filter(([language, count]) => language && count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10) // Show top 10 languages
    .map(([language, count], index) => ({
      name: language,
      value: count,
      color: LANGUAGE_COLORS[index % LANGUAGE_COLORS.length],
      percentage: ((count / Object.values(data).reduce((a, b) => a + b, 0)) * 100).toFixed(1),
    }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm">{data.name}</p>
          <p className="text-xs text-muted-foreground">
            {data.value} repositories ({data.payload.percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="grid grid-cols-2 gap-2 mt-4 max-h-32 overflow-y-auto">
        {payload?.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="truncate font-medium">{entry.value}</span>
            <span className="text-muted-foreground ml-auto">{entry?.payload?.percentage || 0}%</span>
          </div>
        ))}
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <Code className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No language data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={2} dataKey="value">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <CustomLegend payload={chartData} />
    </div>
  )
}
