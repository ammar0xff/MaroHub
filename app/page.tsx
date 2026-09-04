"use client"

import { useState, useEffect, useMemo } from "react"
import { GameCard } from "@/components/game-card"
import { FeaturedSection } from "@/components/featured-section"
import { Filters } from "@/components/filters"
import { Hero } from "@/components/hero"
import { QuickStats } from "@/components/quick-stats"
import { ScrollToTop } from "@/components/scroll-to-top"
import type { Game } from "@/types/game"

export default function Home() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    genre: "all",
    year: "all",
    metacritic: "all",
    size: "",
    sortBy: "name-asc",
  })
  const [displayCount, setDisplayCount] = useState(30)

  useEffect(() => {
    fetch("https://raw.githubusercontent.com/ammar0xff/MaroHub/refs/heads/main/data/games.json")
      .then((res) => res.json())
      .then((data: any[]) => {
        const processedGames = data.map((game, index) => ({
          ...game,
          uniqueId: index,
          genres: game.genres || [],
          platforms: (game.platforms || []).map((p: any) => ({ name: p.name || "Unknown" })),
        }))
        setGames(processedGames)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error loading games:", error)
        setLoading(false)
      })
  }, [])

  const parseSizeToGB = (sizeStr: string): number | null => {
    if (!sizeStr) return null
    const match = sizeStr.match(/([\d.]+)\s*(GB|MB|TB)/i)
    if (!match) return null
    const value = Number.parseFloat(match[1])
    if (isNaN(value)) return null
    const unit = match[2].toUpperCase()
    if (unit === "GB") return value
    if (unit === "MB") return value / 1024
    if (unit === "TB") return value * 1024
    return null
  }

  const filteredAndSortedGames = useMemo(() => {
    let result = games

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (game) =>
          game.name.toLowerCase().includes(term) ||
          game.genres.some((g) => g.toLowerCase().includes(term)) ||
          game.platform_type?.toLowerCase().includes(term) ||
          game.description?.toLowerCase().includes(term),
      )
    }

    // Genre filter
    if (filters.genre !== "all") {
      result = result.filter((game) => game.genres.some((g) => g.toLowerCase() === filters.genre))
    }

    // Year filter
    if (filters.year !== "all") {
      result = result.filter(
        (game) => game.release_date && new Date(game.release_date).getFullYear().toString() === filters.year,
      )
    }

    // Metacritic filter
    const minMeta = Number.parseInt(filters.metacritic)
    if (!isNaN(minMeta)) {
      result = result.filter((game) => game.metacritic !== null && game.metacritic >= minMeta)
    }

    // Size filter
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

    // Sort
    result = [...result].sort((a, b) => {
      switch (filters.sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name)
        case "name-desc":
          return b.name.localeCompare(a.name)
        case "release_date-desc":
          return (
            (b.release_date ? new Date(b.release_date).getTime() : 0) -
            (a.release_date ? new Date(a.release_date).getTime() : 0)
          )
        case "release_date-asc":
          return (
            (a.release_date ? new Date(a.release_date).getTime() : 0) -
            (b.release_date ? new Date(b.release_date).getTime() : 0)
          )
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

  const topRated = useMemo(
    () =>
      games
        .filter((g) => g.metacritic !== null)
        .sort((a, b) => (b.metacritic ?? 0) - (a.metacritic ?? 0))
        .slice(0, 15),
    [games],
  )

  const recentlyAdded = useMemo(
    () =>
      games
        .filter((g) => g.release_date)
        .sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime())
        .slice(0, 15),
    [games],
  )

  const displayedGames = filteredAndSortedGames.slice(0, displayCount)

  const handleClearFilters = () => {
    setSearchTerm("")
    setFilters({
      genre: "all",
      year: "all",
      metacritic: "all",
      size: "",
      sortBy: "name-asc",
    })
  }

  return (
    <>
      <Hero searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <div className="max-w-[1400px] mx-auto px-4 py-8 md:px-6">
        <QuickStats />

        <div className="flex flex-col lg:flex-row gap-6">
          <Filters filters={filters} onFiltersChange={setFilters} games={games} onClear={handleClearFilters} />

          <div className="flex-1 min-w-0 space-y-8">
            <FeaturedSection title="Top Rated Games" games={topRated} />
            <FeaturedSection title="Recently Added" games={recentlyAdded} />

            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : filteredAndSortedGames.length === 0 ? (
                <p className="text-center text-muted-foreground py-20">No games found. Try adjusting your filters.</p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground text-center">
                    {filteredAndSortedGames.length} game{filteredAndSortedGames.length !== 1 ? "s" : ""} found
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {displayedGames.map((game) => (
                      <GameCard key={game.uniqueId} game={game} />
                    ))}
                  </div>

                  {displayCount < filteredAndSortedGames.length && (
                    <div className="flex justify-center pt-6">
                      <button
                        onClick={() => setDisplayCount((prev) => prev + 30)}
                        className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
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
