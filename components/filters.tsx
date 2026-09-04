"use client"

import { Filter, X } from "lucide-react"
import type { Game } from "@/types/game"

interface FiltersProps {
  filters: {
    genre: string
    year: string
    metacritic: string
    size: string
    sortBy: string
  }
  onFiltersChange: (filters: any) => void
  games: Game[]
  onClear: () => void
}

export function Filters({ filters, onFiltersChange, games, onClear }: FiltersProps) {
  const genres = Array.from(new Set(games.flatMap((g) => g.genres))).sort()
  const years = Array.from(
    new Set(games.filter((g) => g.release_date).map((g) => new Date(g.release_date).getFullYear().toString())),
  ).sort((a, b) => Number.parseInt(b) - Number.parseInt(a))

  const updateFilter = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const hasActiveFilters =
    filters.genre !== "all" ||
    filters.year !== "all" ||
    filters.metacritic !== "all" ||
    filters.size !== "" ||
    filters.sortBy !== "name-asc"

  return (
    <aside className="w-full lg:w-72 shrink-0">
      <div className="sticky top-24 space-y-5 rounded-2xl bg-card/50 backdrop-blur-sm p-6 shadow-xl border border-border/50">
        {/* Header with clear button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Filters</h3>
          </div>
          {hasActiveFilters && (
            <button
              onClick={onClear}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground">Genre</label>
            <select
              value={filters.genre}
              onChange={(e) => updateFilter("genre", e.target.value)}
              className="w-full rounded-lg border border-border bg-background/50 px-3 py-2.5 text-sm transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="all">All Genres</option>
              {genres.map((genre) => (
                <option key={genre} value={genre.toLowerCase()}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground">Release Year</label>
            <select
              value={filters.year}
              onChange={(e) => updateFilter("year", e.target.value)}
              className="w-full rounded-lg border border-border bg-background/50 px-3 py-2.5 text-sm transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="all">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground">Metacritic Score</label>
            <select
              value={filters.metacritic}
              onChange={(e) => updateFilter("metacritic", e.target.value)}
              className="w-full rounded-lg border border-border bg-background/50 px-3 py-2.5 text-sm transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="all">Any Score</option>
              <option value="90">90+ Masterpiece</option>
              <option value="80">80+ Excellent</option>
              <option value="70">70+ Good</option>
              <option value="60">60+ Mixed</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground">Download Size</label>
            <select
              value={filters.size}
              onChange={(e) => updateFilter("size", e.target.value)}
              className="w-full rounded-lg border border-border bg-background/50 px-3 py-2.5 text-sm transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="">All Sizes</option>
              <option value="<1">Under 1 GB</option>
              <option value="1-5">1 - 5 GB</option>
              <option value="5-10">5 - 10 GB</option>
              <option value=">10">Over 10 GB</option>
            </select>
          </div>

          <div className="space-y-2 pt-2 border-t border-border/50">
            <label className="block text-sm font-semibold text-foreground">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter("sortBy", e.target.value)}
              className="w-full rounded-lg border border-border bg-background/50 px-3 py-2.5 text-sm transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="name-asc">Name (A → Z)</option>
              <option value="name-desc">Name (Z → A)</option>
              <option value="release_date-desc">Newest First</option>
              <option value="release_date-asc">Oldest First</option>
              <option value="metacritic-desc">Top Rated</option>
              <option value="metacritic-asc">Lowest Rated</option>
            </select>
          </div>
        </div>
      </div>
    </aside>
  )
}
