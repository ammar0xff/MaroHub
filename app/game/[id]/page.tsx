import type { Metadata } from "next"
import { notFound } from "next/navigation"
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
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { WishlistButton } from "@/components/wishlist-button"
import { ShareButton } from "@/components/share-button"
import { getGameById } from "@/lib/games"
import { sanitizeHtml } from "@/lib/sanitize"
import type { Game } from "@/types/game"

interface GameDetailPageProps {
  params: Promise<{ id: string }>
}

export const dynamicParams = false

export async function generateStaticParams() {
  const { getGames } = await import("@/lib/games")
  const games = await getGames()
  return games.map((game) => ({ id: game.id }))
}

export async function generateMetadata({ params }: GameDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const game = await getGameById(id)
  if (!game) return { title: "Game Not Found - MaroHub" }
  return {
    title: `${game.name} - MaroHub`,
    description: game.description ? (game.genres || []).join(", ") || game.name : `Download ${game.name} for Linux.`,
  }
}

export default async function GameDetailPage({ params }: GameDetailPageProps) {
  const { id } = await params
  const game = await getGameById(id)

  if (!game) {
    notFound()
  }

  return <GameDetail game={game} />
}

function GameDetail({ game }: { game: Game }) {
  const heroImageUrl = game.background_image || game.thumbnail

  return (
    <div className="min-h-screen pb-16">
      <div className="relative h-[500px] w-full overflow-hidden">
        {heroImageUrl ? (
          <Image
            src={heroImageUrl}
            alt={game.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-card text-primary font-bold text-4xl">
            {game.name}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />

        <div className="absolute top-8 left-8">
          <Button asChild variant="outline" size="lg" className="gap-2 backdrop-blur-sm bg-background/80 border-border/50">
            <Link href="/" aria-label="Back to games">
              <ArrowLeft className="h-5 w-5" />
              Back to Games
            </Link>
          </Button>
        </div>

        <div className="absolute top-8 right-8 flex gap-3">
          <ShareButton gameId={game.id} gameName={game.name} />
          <WishlistButton gameId={game.id} size="lg" />
        </div>

        <div className="absolute bottom-8 left-8 right-8">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 text-balance">{game.name}</h1>
          {game.metacritic && game.metacritic > 0 && (
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
            <div className="mb-6 flex flex-wrap gap-2">
              {game.is_native_linux_torrent && (
                <Badge variant="default" className="px-3 py-1.5 text-sm">
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
                    {formatDate(game.release_date)}
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

            {game.magnet ? (
              <a
                href={game.magnet}
                className="inline-flex items-center gap-3 rounded-xl bg-primary px-8 py-4 text-lg font-bold text-primary-foreground hover:shadow-2xl hover:shadow-primary/30 transition-all hover:scale-105"
              >
                <Download className="h-6 w-6" />
                Download via Magnet Link
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">No magnet link available for this game.</p>
            )}
          </div>

          {game.description && <DescriptionSection game={game} />}

          {hasRequirements(game) && <RequirementsSection game={game} />}

          {game.screenshots && game.screenshots.length > 0 && <ScreenshotsSection game={game} />}
        </div>
      </div>
    </div>
  )
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

function hasRequirements(game: Game): boolean {
  return Boolean(
    game.platforms &&
      game.platforms.length > 0 &&
      game.platforms.some((p) => p.requirements?.minimum || p.requirements?.recommended),
  )
}

function DescriptionSection({ game }: { game: Game }) {
  const safe = sanitizeHtml(game.description)
  return (
    <div className="rounded-2xl bg-card/50 backdrop-blur-sm p-8 shadow-xl border border-border/50">
      <h2 className="mb-6 text-2xl font-bold text-foreground">About This Game</h2>
      <div
        className="text-muted-foreground leading-relaxed max-w-none"
        dangerouslySetInnerHTML={{ __html: safe || escapePlain(game.description as string) }}
      />
    </div>
  )
}

function escapePlain(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>")
}

function RequirementsSection({ game }: { game: Game }) {
  const platforms =
    game.platforms
      ?.filter((p) => p.requirements?.minimum || p.requirements?.recommended)
      .map((platform) => ({
        name: platform.name,
        minimum: sanitizeHtml(platform.requirements?.minimum),
        recommended: sanitizeHtml(platform.requirements?.recommended),
      })) || []

  if (platforms.length === 0) return null

  return (
    <div className="rounded-2xl bg-card/50 backdrop-blur-sm p-8 shadow-xl border border-border/50">
      <h2 className="mb-6 text-2xl font-bold text-foreground">System Requirements</h2>
      <div className="space-y-8">
        {platforms.map((platform, idx) => (
          <div key={idx} className="space-y-5">
            <h3 className="font-bold text-xl text-primary flex items-center gap-2">
              <Gamepad2 className="h-5 w-5" />
              {platform.name}
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              {platform.minimum && (
                <div className="space-y-3 p-5 bg-muted/30 rounded-xl border border-border/30">
                  <p className="text-sm font-bold text-foreground uppercase tracking-wide">Minimum Requirements</p>
                  <div
                    className="text-sm text-muted-foreground leading-relaxed max-w-none"
                    dangerouslySetInnerHTML={{ __html: platform.minimum }}
                  />
                </div>
              )}
              {platform.recommended && (
                <div className="space-y-3 p-5 bg-primary/5 rounded-xl border border-primary/20">
                  <p className="text-sm font-bold text-primary uppercase tracking-wide">Recommended Requirements</p>
                  <div
                    className="text-sm text-muted-foreground leading-relaxed max-w-none"
                    dangerouslySetInnerHTML={{ __html: platform.recommended }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ScreenshotsSection({ game }: { game: Game }) {
  return (
    <div className="rounded-2xl bg-card/50 backdrop-blur-sm p-8 shadow-xl border border-border/50">
      <h2 className="mb-6 text-2xl font-bold text-foreground">Screenshots & Media</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {game.screenshots!.map((screenshot, idx) => (
          <div
            key={idx}
            className="group relative aspect-video overflow-hidden rounded-xl bg-muted border border-border/30 hover:border-primary/50 transition-colors"
          >
            {screenshot ? (
              <Image
                src={screenshot}
                alt={`${game.name} screenshot ${idx + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                unoptimized
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}