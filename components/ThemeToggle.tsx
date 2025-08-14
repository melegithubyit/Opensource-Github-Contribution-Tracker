"use client"
import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const ls = localStorage.getItem("theme")
      const sys = window.matchMedia("(prefers-color-scheme:dark)").matches
      const dark = ls === "dark" || (!ls && sys)
      setIsDark(dark)
    } catch { /* ignore */ }
  }, [])

  const toggle = () => {
    const next = !isDark
    setIsDark(next)
    try {
      localStorage.setItem("theme", next ? "dark" : "light")
    } catch { /* ignore */ }
    if (next) document.documentElement.classList.add("dark")
    else document.documentElement.classList.remove("dark")
  }

  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      aria-label="Toggle theme"
      onClick={toggle}
      className="w-9 h-9"
    >
      {!mounted ? null : isDark ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  )
}
