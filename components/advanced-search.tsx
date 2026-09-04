"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"

interface AdvancedSearchProps {
  onSearch: (term: string) => void
  searchTerm: string
}

export function AdvancedSearch({ onSearch, searchTerm }: AdvancedSearchProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div
        className={`relative flex items-center gap-3 rounded-2xl border-2 bg-background/80 backdrop-blur-md px-6 py-4 shadow-2xl transition-all duration-300 ${
          isFocused ? "border-primary shadow-primary/20" : "border-border/50 hover:border-border"
        }`}
      >
        <Search
          className={`h-6 w-6 flex-shrink-0 transition-colors ${isFocused ? "text-primary" : "text-muted-foreground"}`}
        />

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search 100,000+ Linux games... Try 'Witcher', 'indie horror', or 'multiplayer FPS'"
          className="flex-1 bg-transparent text-lg outline-none placeholder:text-muted-foreground/60"
        />

        {searchTerm && (
          <button
            onClick={() => onSearch("")}
            className="flex-shrink-0 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Search suggestions */}
      {searchTerm && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden z-50">
          <div className="p-3 text-xs text-muted-foreground border-b border-border/50">
            Press Enter to search or clear to see all games
          </div>
        </div>
      )}
    </div>
  )
}
