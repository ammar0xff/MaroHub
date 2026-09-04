"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Download,
  Gamepad2,
  Globe,
  HardDrive,
  Wine,
  Star,
  Calendar,
  Tag,
  Share2,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { WishlistButton } from "@/components/wishlist-button"
import type { Game } from "@/types/game"

export default function GameDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [shareSuccess, setShareSuccess] = useState(false)

  useEffect(() => {
    fetch("https://raw.githubusercontent.com/ammar0xff/MaroHub/refs/heads/main/data/games.json")
      .then((res) => res.json())
      .then((data: any[]) => {
        const gameId = Number.parseInt(params.id as string)
        const foundGame = data[gameId]
        if (foundGame) {
          setGame({ ...foundGame, uniqueId: gameId })
        }
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error loading game:", error)
        setLoading(false)
      })
  }, [params.id])

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: game?.name || "Game on MaroHub",
          text: `Check out ${game?.name} on MaroHub!`,
          url: url,
        })
      } catch (err) {
        console.log("Share failed", err)
      }
    } else {
      await navigator.clipboard.writeText(url)
      setShareSuccess(true)
      setTimeout(() => setShareSuccess(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!game) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-foreground">Game Not Found</h1>
          <p className="text-lg text-muted-foreground">The game you're looking for doesn't exist.</p>
        </div>
        <Button onClick={() => router.push("/")} size="lg" className="gap-2">
          <ArrowLeft className="h-5 w-5" />
          Browse All Games
        </Button>
      </div>
    )
  }

  const heroImageUrl = game.background_image || game.thumbnail || "/placeholder.svg?height=500&width=1200"

  return (
    <div className="min-h-screen pb-16">
      <div className="relative h-[500px] w-full overflow-hidden">
        <Image src={heroImageUrl || "/placeholder.svg"} alt={game.name} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />

        {/* Back button */}
        <div className="absolute top-8 left-8">
          <Link href="/">
            <Button variant="outline" size="lg" className="gap-2 backdrop-blur-sm bg-background/80 border-border/50">
              <ArrowLeft className="h-5 w-5" />
              Back to Games
            </Button>
          </Link>
        </div>

        {/* Wishlist and share buttons in top-right */}
        <div className="absolute top-8 right-8 flex gap-3">
          <Button
            onClick={handleShare}
            variant="outline"
            size="lg"
            className="gap-2 backdrop-blur-sm bg-background/80 border-border/50"
          >
            <Share2 className="h-5 w-5" />
            {shareSuccess ? "Copied!" : "Share"}
          </Button>
          <WishlistButton gameId={game.uniqueId} size="lg" />
        </div>

        {/* Game title overlay */}
        <div className="absolute bottom-8 left-8 right-8">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 text-balance">{game.name}</h1>
          {game.metacritic !== null && game.metacritic > 0 && (
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/90 backdrop-blur-sm px-5 py-2.5 text-lg font-bold text-primary-foreground shadow-xl">
              <Star className="h-5 w-5 fill-current" />
              {game.metacritic}/100
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">
        <div className="-mt-8 space-y-8">
          <div className="rounded-2xl bg-card/50 backdrop-blur-sm p-8 shadow-2xl border border-border/50">
            {/* Platform badges */}
            <div className="mb-6 flex flex-wrap gap-2">
              {game.is_native_linux_torrent && (
                <Badge variant="default" className="bg-green-600 hover:bg-green-700 px-3 py-1.5 text-sm">
                  <Gamepad2 className="mr-1.5 h-4 w-4" />
                  Native Linux
                </Badge>
              )}
              {game.is_wine_bottled_torrent && (
                <Badge variant="secondary" className="px-3 py-1.5 text-sm">
                  <Wine className="mr-1.5 h-4 w-4" />
                  Wine/Proton
                </Badge>
              )}
              {game.languages_info && (
                <Badge variant="outline" className="px-3 py-1.5 text-sm">
                  <Globe className="mr-1.5 h-4 w-4" />
                  {game.languages_info}
                </Badge>
              )}
              {game.release_group && (
                <Badge variant="outline" className="px-3 py-1.5 text-sm">
                  <Tag className="mr-1.5 h-4 w-4" />
                  {game.release_group}
                </Badge>
              )}
            </div>

            {/* Metadata grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              {game.genres.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Genre</p>
                  <p className="text-lg text-foreground font-medium">{game.genres.join(", ")}</p>
                </div>
              )}

              {game.release_date && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Release Date</p>
                  <p className="text-lg text-foreground font-medium flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    {new Date(game.release_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}

              {game.size && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Download Size</p>
                  <p className="text-lg text-foreground font-medium flex items-center gap-2">
                    <HardDrive className="h-5 w-5 text-primary" />
                    {game.size}
                  </p>
                </div>
              )}

              {game.platform_type && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Platform</p>
                  <p className="text-lg text-foreground font-medium">{game.platform_type}</p>
                </div>
              )}

              {game.version && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Version</p>
                  <p className="text-lg text-foreground font-medium">{game.version}</p>
                </div>
              )}

              {game.extracted_appid && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Steam App ID</p>
                  <a
                    href={`https://store.steampowered.com/app/${game.extracted_appid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg text-primary font-medium hover:underline flex items-center gap-2"
                  >
                    {game.extracted_appid}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>

            {/* Download button */}
            {game.magnet && (
              <a
                href={game.magnet}
                className="inline-flex items-center gap-3 rounded-xl bg-primary px-8 py-4 text-lg font-bold text-primary-foreground hover:shadow-2xl hover:shadow-primary/30 transition-all hover:scale-105"
              >
                <Download className="h-6 w-6" />
                Download via Magnet Link
              </a>
            )}
          </div>

          {(game.original_torrent_name ||
            game.cleaned_search_name ||
            game.rawg_id ||
            game.rawg_name ||
            (game.other_torrent_tags && game.other_torrent_tags.length > 0)) && (
            <div className="rounded-2xl bg-card/50 backdrop-blur-sm p-8 shadow-xl border border-border/50">
              <h2 className="mb-6 text-2xl font-bold text-foreground">Torrent & Database Information</h2>

              <div className="space-y-4">
                {game.original_torrent_name && (
                  <div className="p-4 bg-muted/30 rounded-xl border border-border/30">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      Original Torrent Name
                    </p>
                    <p className="text-sm text-foreground font-mono break-all">{game.original_torrent_name}</p>
                  </div>
                )}

                {game.cleaned_search_name && (
                  <div className="p-4 bg-muted/30 rounded-xl border border-border/30">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      Cleaned Search Name
                    </p>
                    <p className="text-sm text-foreground font-mono break-all">{game.cleaned_search_name}</p>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  {game.rawg_id && (
                    <div className="p-4 bg-muted/30 rounded-xl border border-border/30">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        RAWG Database ID
                      </p>
                      <p className="text-sm text-foreground font-mono">{game.rawg_id}</p>
                    </div>
                  )}

                  {game.rawg_name && (
                    <div className="p-4 bg-muted/30 rounded-xl border border-border/30">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">RAWG Name</p>
                      <p className="text-sm text-foreground font-mono">{game.rawg_name}</p>
                    </div>
                  )}
                </div>

                {game.other_torrent_tags && game.other_torrent_tags.length > 0 && (
                  <div className="p-4 bg-muted/30 rounded-xl border border-border/30">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                      Additional Tags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {game.other_torrent_tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="px-3 py-1">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {game.description && (
            <div className="rounded-2xl bg-card/50 backdrop-blur-sm p-8 shadow-xl border border-border/50">
              <h2 className="mb-6 text-2xl font-bold text-foreground">About This Game</h2>
              <div
                className="text-muted-foreground leading-relaxed prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: game.description.replace(/\n/g, "<br/>") }}
              />
            </div>
          )}

          {game.platforms &&
            game.platforms.length > 0 &&
            game.platforms.some((p) => p.requirements?.minimum || p.requirements?.recommended) && (
              <div className="rounded-2xl bg-card/50 backdrop-blur-sm p-8 shadow-xl border border-border/50">
                <h2 className="mb-6 text-2xl font-bold text-foreground">System Requirements</h2>
                <div className="space-y-8">
                  {game.platforms
                    .filter((p) => p.requirements?.minimum !== "N/A" || p.requirements?.recommended !== "N/A")
                    .map((platform, idx) => (
                      <div key={idx} className="space-y-5">
                        <h3 className="font-bold text-xl text-primary flex items-center gap-2">
                          <Gamepad2 className="h-5 w-5" />
                          {platform.name}
                        </h3>
                        <div className="grid gap-6 md:grid-cols-2">
                          {platform.requirements?.minimum && platform.requirements.minimum !== "N/A" && (
                            <div className="space-y-3 p-5 bg-muted/30 rounded-xl border border-border/30">
                              <p className="text-sm font-bold text-foreground uppercase tracking-wide">
                                Minimum Requirements
                              </p>
                              <div
                                className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: platform.requirements.minimum }}
                              />
                            </div>
                          )}
                          {platform.requirements?.recommended && platform.requirements.recommended !== "N/A" && (
                            <div className="space-y-3 p-5 bg-primary/5 rounded-xl border border-primary/20">
                              <p className="text-sm font-bold text-primary uppercase tracking-wide">
                                Recommended Requirements
                              </p>
                              <div
                                className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: platform.requirements.recommended }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

          {game.screenshots && game.screenshots.length > 0 && (
            <div className="rounded-2xl bg-card/50 backdrop-blur-sm p-8 shadow-xl border border-border/50">
              <h2 className="mb-6 text-2xl font-bold text-foreground">Screenshots & Media</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {game.screenshots.map((screenshot, idx) => (
                  <div
                    key={idx}
                    className="group relative aspect-video overflow-hidden rounded-xl bg-muted border border-border/30 hover:border-primary/50 transition-all"
                  >
                    <Image
                      src={screenshot || "/placeholder.svg?height=400&width=600"}
                      alt={`${game.name} Screenshot ${idx + 1}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
