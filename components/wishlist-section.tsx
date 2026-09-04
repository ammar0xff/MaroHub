"use client"

import { useEffect, useState } from "react"
import { Heart } from "lucide-react"
import { GameCard } from "./game-card"
import { readWishlist, WISHLIST_EVENT } from "@/lib/wishlist"
import type { GameSummary } from "@/types/game"

interface WishlistSectionProps {
  games: GameSummary[]
}

export function WishlistSection({ games }: WishlistSectionProps) {
  const [wishlistIds, setWishlistIds] = useState<string[]>([])

  useEffect(() => {
    const update = () => setWishlistIds(readWishlist())
    update()
    window.addEventListener(WISHLIST_EVENT, update)
    window.addEventListener("storage", update)
    return () => {
      window.removeEventListener(WISHLIST_EVENT, update)
      window.removeEventListener("storage", update)
    }
  }, [])

  const byId = new Map(games.map((game) => [game.id, game]))
  const wishlisted = wishlistIds.map((id) => byId.get(id)).filter((game): game is GameSummary => Boolean(game))

  if (wishlistIds.length === 0) return null

  return (
    <section id="wishlist" className="scroll-mt-24 space-y-5">
      <div className="flex items-center gap-2">
        <Heart className="h-6 w-6 text-primary fill-current" />
        <h2 className="text-3xl font-bold text-foreground">Your Wishlist</h2>
      </div>
      {wishlisted.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlisted.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">
          A saved game is no longer in the catalog. Tap the heart on a game to build your list.
        </p>
      )}
    </section>
  )
}