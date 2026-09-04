"use client"

import { Search, Terminal } from "lucide-react"

interface HeroProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  gameCount: number
}

export function Hero({ searchTerm, onSearchChange, gameCount }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-background py-24 md:py-40">
      <div className="absolute inset-0 bg-grid-white/5" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary border border-primary/20">
          <Terminal className="h-4 w-4" />
          <span>{gameCount.toLocaleString()} ready-to-run Linux games</span>
        </div>

        <h1 className="mb-6 text-5xl font-bold tracking-tight text-balance md:text-7xl lg:text-8xl">
          Your Gateway to
          <span className="block mt-2 text-primary">Linux Gaming</span>
        </h1>

        <p className="mb-12 text-lg text-muted-foreground md:text-xl lg:text-2xl max-w-3xl mx-auto text-balance">
          Discover games that run on Linux. No ads, no accounts, just magnet links.
        </p>

        <div className="mx-auto flex max-w-2xl items-center gap-3 rounded-2xl bg-card/80 backdrop-blur-sm p-3 border border-border/50">
          <Search className="ml-3 h-6 w-6 text-primary shrink-0" />
          <input
            type="text"
            role="searchbox"
            aria-label="Search games"
            placeholder="Search by name or genre, e.g. Witcher or RPG..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 bg-transparent px-2 py-3 text-lg text-foreground outline-none placeholder:text-muted-foreground min-w-0"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </section>
  )
}