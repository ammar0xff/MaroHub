"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { GameCard } from "./game-card"
import type { Game } from "@/types/game"

interface FeaturedSectionProps {
  title: string
  games: Game[]
}

export function FeaturedSection({ title, games }: FeaturedSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  if (games.length === 0) return null

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">{title}</h2>
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="rounded-lg bg-card/80 p-2.5 shadow-lg backdrop-blur-sm transition-all hover:bg-accent hover:scale-110 border border-border/50"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="rounded-lg bg-card/80 p-2.5 shadow-lg backdrop-blur-sm transition-all hover:bg-accent hover:scale-110 border border-border/50"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="relative group">
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth snap-x snap-mandatory"
        >
          {games.map((game) => (
            <div key={game.uniqueId} className="w-[300px] shrink-0 snap-start">
              <GameCard game={game} />
            </div>
          ))}
        </div>

        {/* Mobile navigation hints */}
        <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none md:hidden" />
        <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none md:hidden" />
      </div>
    </div>
  )
}
