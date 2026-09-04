"use client"

import { useState } from "react"
import { Filter, X, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FilterState } from "@/types/game"

interface FiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  genres: string[]
  years: string[]
  onClear: () => void
}

const SIZE_OPTIONS = [
  { value: "", label: "All Sizes" },
  { value: "<1", label: "Under 1 GB" },
  { value: "1-5", label: "1 - 5 GB" },
  { value: "5-10", label: "5 - 10 GB" },
  { value: ">10", label: "Over 10 GB" },
]

const METASCORE_OPTIONS = [
  { value: "all", label: "Any Score" },
  { value: "90", label: "90+ Masterpiece" },
  { value: "80", label: "80+ Excellent" },
  { value: "70", label: "70+ Good" },
  { value: "60", label: "60+ Mixed" },
]

const SORT_OPTIONS = [
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "release_date-desc", label: "Newest First" },
  { value: "release_date-asc", label: "Oldest First" },
  { value: "metacritic-desc", label: "Top Rated" },
  { value: "metacritic-asc", label: "Lowest Rated" },
]

export function Filters({ filters, onFiltersChange, genres, years, onClear }: FiltersProps) {
  const [open, setOpen] = useState(false)

  const updateFilter = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const hasActiveFilters =
    filters.genre !== "all" ||
    filters.year !== "all" ||
    filters.metacritic !== "all" ||
    filters.size !== "" ||
    filters.sortBy !== "name-asc"

  const activeFilterCount =
    (filters.genre !== "all" ? 1 : 0) +
    (filters.year !== "all" ? 1 : 0) +
    (filters.metacritic !== "all" ? 1 : 0) +
    (filters.size !== "" ? 1 : 0) +
    (filters.sortBy !== "name-asc" ? 1 : 0)

  const selectClass =
    "w-full rounded-lg border border-border bg-background/50 px-3 py-3 text-base lg:text-sm transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"

  return (
    <aside className="w-full lg:w-72 shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="filter-panel"
        className="flex w-full items-center justify-between rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 lg:hidden min-h-12 transition-colors hover:border-primary/50"
      >
        <span className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Filter className="h-5 w-5 text-primary" />
          Filters
        </span>
        <span className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", open && "rotate-180")} />
        </span>
      </button>

      <div
        id="filter-panel"
        className={cn("mt-4 lg:mt-0 lg:block", open ? "block" : "hidden")}
      >
        <div className="space-y-5 rounded-2xl bg-card/50 backdrop-blur-sm p-5 lg:sticky lg:top-24 lg:p-6 shadow-xl border border-border/50">
          <div className="hidden lg:flex items-center justify-between">
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

          {hasActiveFilters && (
            <button
              onClick={onClear}
              className="flex w-full items-center justify-center gap-1 rounded-lg border border-border/50 bg-background/40 p-3 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors min-h-11 lg:hidden"
            >
              <X className="h-4 w-4" />
              Clear all filters
            </button>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="filter-genre" className="block text-sm font-semibold text-foreground">
                Genre
              </label>
              <select
                id="filter-genre"
                value={filters.genre}
                onChange={(e) => updateFilter("genre", e.target.value)}
                className={selectClass}
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
              <label htmlFor="filter-year" className="block text-sm font-semibold text-foreground">
                Release Year
              </label>
              <select
                id="filter-year"
                value={filters.year}
                onChange={(e) => updateFilter("year", e.target.value)}
                className={selectClass}
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
              <label htmlFor="filter-metacritic" className="block text-sm font-semibold text-foreground">
                Metacritic Score
              </label>
              <select
                id="filter-metacritic"
                value={filters.metacritic}
                onChange={(e) => updateFilter("metacritic", e.target.value)}
                className={selectClass}
              >
                {METASCORE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="filter-size" className="block text-sm font-semibold text-foreground">
                Download Size
              </label>
              <select
                id="filter-size"
                value={filters.size}
                onChange={(e) => updateFilter("size", e.target.value)}
                className={selectClass}
              >
                {SIZE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/50">
              <label htmlFor="filter-sort" className="block text-sm font-semibold text-foreground">
                Sort By
              </label>
              <select
                id="filter-sort"
                value={filters.sortBy}
                onChange={(e) => updateFilter("sortBy", e.target.value)}
                className={selectClass}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}