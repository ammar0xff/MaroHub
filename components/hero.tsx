"use client"

import { Search } from "lucide-react"

interface HeroProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  gameCount: number
}

export function Hero({ searchTerm, onSearchChange, gameCount }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-background py-16 md:py-32">
      <div className="absolute inset-0 bg-grid-white/5" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

      <div className="relative mx-auto max-w-5xl px-5 sm:px-6 text-center">
        <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-2 text-xs font-medium text-primary border border-primary/20 sm:text-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {gameCount.toLocaleString()} ready-to-run Linux games
        </div>

        <h1 className="mb-5 text-[clamp(2rem,8vw,3rem)] font-bold tracking-tight text-balance md:text-7xl lg:text-8xl md:mb-6">
          Your Gateway to
          <span className="block mt-1.5 md:mt-2 text-primary">Linux Gaming</span>
        </h1>

        <p className="mb-8 md:mb-12 text-base sm:text-lg md:text-xl text-muted-foreground md:text-2xl max-w-3xl mx-auto text-balance">
          Discover games that run on Linux. No ads, no accounts, just magnet links.
        </p>

        <div className="mx-auto flex max-w-2xl items-center gap-2 rounded-2xl bg-card/80 backdrop-blur-sm p-2.5 border border-border/50 sm:p-3">
          <Search className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
          <input
            type="text"
            role="searchbox"
            aria-label="Search games"
            placeholder="Search by name or genre"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 bg-transparent px-2 py-3 sm:py-3 text-base sm:text-lg text-foreground outline-none placeholder:text-muted-foreground min-w-0"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0 min-h-11"
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