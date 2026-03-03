"use client"

import { Search } from "lucide-react"
import { useState } from "react"

const filters = ["Blog", "Guides", "Destinations"] as const

export function SearchBar() {
  const [activeFilter, setActiveFilter] = useState<string>("Blog")

  return (
    <div className="flex items-center gap-3 rounded-full border border-border bg-card px-5 py-3 shadow-sm">
      <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
      <input
        type="text"
        placeholder="Search for destinations travel guides and more.."
        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
      <div className="hidden items-center gap-2 md:flex">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
              activeFilter === filter
                ? "border-foreground bg-foreground text-primary-foreground"
                : "border-border bg-card text-foreground hover:bg-secondary"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  )
}
