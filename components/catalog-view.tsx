"use client"

import { useState, useMemo } from "react"
import { GameCard } from "@/components/game-card"
import { FeaturedSection } from "@/components/featured-section"
import { Filters } from "@/components/filters"
import { Hero } from "@/components/hero"
import { QuickStats } from "@/components/quick-stats"
import { ScrollToTop } from "@/components/scroll-to-top"
import { WishlistSection } from "@/components/wishlist-section"
import { DEFAULT_FILTERS, type CatalogStats, type FilterState, type GameSummary } from "@/types/game"
import { parseSizeToGB } from "@/lib/format"

interface CatalogViewProps {
  games: GameSummary[]
  stats: CatalogStats
  topRated: GameSummary[]
  recentlyAdded: GameSummary[]
}

export function CatalogView({ games, stats, topRated, recentlyAdded }: CatalogViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [displayCount, setDisplayCount] = useState(30)

  const genres = useMemo(() => Array.from(new Set(games.flatMap((g) => g.genres))).sort(), [games])
  const years = useMemo(
    () =>
      Array.from(
        new Set(
          games
            .filter((g) => g.release_date)
            .map((g) => new Date(g.release_date as string).getFullYear().toString()),
        ),
      ).sort((a, b) => Number.parseInt(b) - Number.parseInt(a)),
    [games],
  )

  const filteredAndSortedGames = useMemo(() => {
    let result: GameSummary[] = games

    if (searchTerm) {
      const term = searchTerm.trim().toLowerCase()
      result = result.filter(
        (game) =>
          game.name.toLowerCase().includes(term) ||
          (game.genres || []).some((g) => g.toLowerCase().includes(term)) ||
          (game.platform_type || "").toLowerCase().includes(term),
      )
    }

    if (filters.genre !== "all") {
      result = result.filter((game) => (game.genres || []).some((g) => g.toLowerCase() === filters.genre))
    }

    if (filters.year !== "all") {
      result = result.filter(
        (game) => game.release_date && new Date(game.release_date).getFullYear().toString() === filters.year,
      )
    }

    const minMeta = Number.parseInt(filters.metacritic)
    if (!Number.isNaN(minMeta)) {
      result = result.filter((game) => game.metacritic !== null && game.metacritic !== undefined && game.metacritic >= minMeta)
    }

    if (filters.size) {
      result = result.filter((game) => {
        const sizeGB = parseSizeToGB(game.size)
        if (sizeGB === null) return false
        if (filters.size === "<1") return sizeGB < 1
        if (filters.size === "1-5") return sizeGB >= 1 && sizeGB <= 5
        if (filters.size === "5-10") return sizeGB > 5 && sizeGB <= 10
        if (filters.size === ">10") return sizeGB > 10
        return true
      })
    }

    result = [...result].sort((a, b) => {
      switch (filters.sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name)
        case "name-desc":
          return b.name.localeCompare(a.name)
        case "release_date-desc":
          return (
            (new Date(b.release_date || 0).getTime() || 0) - (new Date(a.release_date || 0).getTime() || 0)
          )
        case "release_date-asc":
          return (new Date(a.release_date || 0).getTime() || 0) - (new Date(b.release_date || 0).getTime() || 0)
        case "metacritic-desc":
          return (b.metacritic ?? Number.NEGATIVE_INFINITY) - (a.metacritic ?? Number.NEGATIVE_INFINITY)
        case "metacritic-asc":
          return (a.metacritic ?? Number.POSITIVE_INFINITY) - (b.metacritic ?? Number.POSITIVE_INFINITY)
        default:
          return 0
      }
    })

    return result
  }, [games, searchTerm, filters])

  const displayedGames = filteredAndSortedGames.slice(0, displayCount)

  const handleClearFilters = () => {
    setSearchTerm("")
    setFilters(DEFAULT_FILTERS)
  }

  return (
    <>
      <Hero searchTerm={searchTerm} onSearchChange={setSearchTerm} gameCount={stats.totalGames} />

      <div className="max-w-[1400px] mx-auto px-4 py-8 md:px-6">
        <WishlistSection games={games} />
        <QuickStats stats={stats} />

        <div className="flex flex-col lg:flex-row gap-6">
          <Filters
            filters={filters}
            onFiltersChange={setFilters}
            genres={genres}
            years={years}
            onClear={handleClearFilters}
          />

          <div className="flex-1 min-w-0 space-y-8">
            <FeaturedSection title="Top Rated Games" games={topRated} />
            <FeaturedSection title="Recently Added" games={recentlyAdded} />

            <div className="space-y-4">
              {filteredAndSortedGames.length === 0 ? (
                <p className="text-center text-muted-foreground py-20">No games found. Try adjusting your filters.</p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground text-center">
                    {filteredAndSortedGames.length} game{filteredAndSortedGames.length !== 1 ? "s" : ""} found
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {displayedGames.map((game) => (
                      <GameCard key={game.id} game={game} />
                    ))}
                  </div>

                  {displayCount < filteredAndSortedGames.length && (
                    <div className="flex justify-center pt-6">
                      <button
                        onClick={() => setDisplayCount((prev) => prev + 30)}
                        className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity min-h-11"
                      >
                        Load More ({displayCount} / {filteredAndSortedGames.length})
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <ScrollToTop />
    </>
  )
}