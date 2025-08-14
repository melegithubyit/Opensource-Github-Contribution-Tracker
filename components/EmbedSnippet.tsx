"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"

export default function EmbedSnippet({ username }: { username: string }) {
  const [copied, setCopied] = useState(false)
  const src = `${typeof window !== "undefined" ? window.location.origin : ""}/?username=${encodeURIComponent(username)}`
  const code = `<iframe src="${src}" width="600" height="500" frameborder="0"></iframe>`
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {/* ignore */}
  }
  return (
    <div className="border rounded-md p-4 space-y-2">
      <p className="text-sm font-medium">Embed Widget</p>
      <code className="block text-[10px] bg-muted p-2 rounded overflow-x-auto">{code}</code>
      <Button size="sm" variant="outline" onClick={copy} className="h-7 text-xs">
        <Copy className="h-3 w-3 mr-1" />
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  )
}
