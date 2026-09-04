"use client"

import { Search, Sparkles } from "lucide-react"

interface HeroProps {
  searchTerm: string
  onSearchChange: (value: string) => void
}

export function Hero({ searchTerm, onSearchChange }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-background py-24 md:py-40">
      {/* Animated background pattern */}
      <div className="absolute inset-0 bg-grid-white/5" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

      {/* Floating orbs for visual interest */}
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary border border-primary/20 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="h-4 w-4" />
          <span>10,000+ Linux Games Ready to Play</span>
        </div>

        <h1 className="mb-6 text-5xl font-bold tracking-tight text-balance md:text-7xl lg:text-8xl animate-in fade-in slide-in-from-top-3">
          Your Gateway to
          <span className="block mt-2 bg-gradient-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent animate-gradient">
            Linux Gaming
          </span>
        </h1>

        <p className="mb-12 text-lg text-muted-foreground md:text-xl lg:text-2xl max-w-3xl mx-auto text-balance animate-in fade-in slide-in-from-top-4">
          Discover thousands of ready-to-run games for Linux. No ads, no hassle—just pure gaming.
        </p>

        <div className="mx-auto flex max-w-2xl items-center gap-4 rounded-2xl bg-card/80 backdrop-blur-sm p-3 shadow-2xl shadow-primary/10 border border-border/50 animate-in fade-in slide-in-from-top-5">
          <Search className="ml-3 h-6 w-6 text-primary" />
          <input
            type="text"
            placeholder="Search for your next adventure..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 bg-transparent px-2 py-3 text-lg text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:shadow-lg hover:shadow-primary/30 transition-all hover:scale-105">
            Search
          </button>
        </div>
      </div>
    </section>
  )
}
