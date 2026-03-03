"use client"

import { Sun, Moon, CloudMoon, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

const themes = [
  { value: "system", icon: Monitor, label: "System" },
  { value: "light", icon: Sun, label: "Light" },
  { value: "dim", icon: CloudMoon, label: "Dim" },
  { value: "dark", icon: Moon, label: "Dark" },
] as const

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="h-9 w-[148px] rounded-full bg-secondary" />
  }

  const activeIndex = themes.findIndex((t) => t.value === theme)

  return (
    <div
      className="relative flex h-9 items-center rounded-full bg-secondary p-1 w-[148px]"
      role="radiogroup"
      aria-label="Theme selection"
    >
      {/* Sliding indicator */}
      <div
        className="absolute h-7 w-[32px] rounded-full bg-card shadow-sm transition-transform duration-300 ease-in-out"
        style={{
          transform: `translateX(calc(${activeIndex} * 35px))`,
          left: "4px",
        }}
      />

      {themes.map(({ value, icon: Icon, label }) => {
        const isActive = theme === value
        return (
          <button
            key={value}
            role="radio"
            aria-checked={isActive}
            aria-label={label}
            onClick={() => setTheme(value)}
            className={`relative z-10 flex h-7 w-8 items-center justify-center rounded-full transition-colors duration-200 ${
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        )
      })}
    </div>
  )
}
