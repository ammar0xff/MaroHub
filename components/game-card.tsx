import Link from "next/link"
import Image from "next/image"
import { Star, HardDrive, Calendar } from "lucide-react"
import type { Game } from "@/types/game"
import { Badge } from "@/components/ui/badge"
import { WishlistButton } from "@/components/wishlist-button"

interface GameCardProps {
  game: Game
}

export function GameCard({ game }: GameCardProps) {
  const imageUrl = game.thumbnail || game.background_image || "/placeholder.svg?height=300&width=400"

  return (
    <Link
      href={`/game/${game.uniqueId}`}
      className="group block overflow-hidden rounded-2xl bg-card/50 backdrop-blur-sm shadow-lg transition-all hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 border border-border/50 hover:border-primary/50"
    >
      {/* Image container with overlay */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={game.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <WishlistButton gameId={game.uniqueId} size="sm" />
        </div>

        {/* Metacritic badge if available */}
        {game.metacritic !== null && game.metacritic > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-primary/90 backdrop-blur-sm px-3 py-1.5 text-sm font-bold text-primary-foreground shadow-lg">
            <Star className="h-3.5 w-3.5 fill-current" />
            {game.metacritic}
          </div>
        )}
      </div>

      <div className="p-5 space-y-3">
        <h3 className="font-bold text-lg text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {game.name}
        </h3>

        {/* Genre badges */}
        {game.genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {game.genres.slice(0, 3).map((genre) => (
              <Badge key={genre} variant="secondary" className="text-xs px-2 py-0.5">
                {genre}
              </Badge>
            ))}
            {game.genres.length > 3 && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                +{game.genres.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Metadata row */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
          {game.release_date && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(game.release_date).getFullYear()}
            </div>
          )}
          {game.size && (
            <div className="flex items-center gap-1.5">
              <HardDrive className="h-3.5 w-3.5" />
              {game.size}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
