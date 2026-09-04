import type { CatalogStats, Game, GameSummary } from "@/types/game"

const GAMES_URL = "https://raw.githubusercontent.com/ammar0xff/MaroHub/refs/heads/main/data/games.json"
const TTL_MS = 60 * 60 * 1000

interface CacheEntry {
  at: number
  games: Game[]
}

let cache: CacheEntry | null = null

function deriveGameId(magnet: string | undefined, rawgId: number | string | null | undefined, index: number): string {
  const btih = magnet?.match(/btih:([a-fA-F0-9]{40})/)?.[1]
  if (btih) return btih.toLowerCase()
  if (rawgId !== null && rawgId !== undefined && rawgId !== "") return `rawg-${rawgId}`
  return `idx-${index}`
}

function normalizeGame(raw: Record<string, unknown>, index: number): Game {
  const genres = Array.isArray(raw.genres) ? (raw.genres as string[]) : []
  const platforms = Array.isArray(raw.platforms)
    ? (raw.platforms as { name?: string }[]).map((p) => ({ name: p.name || "Unknown" }))
    : []

  const metacritic = typeof raw.metacritic === "number" ? raw.metacritic : null
  const rawgIdRaw = raw.rawg_id

  return {
    id: deriveGameId(
      typeof raw.magnet === "string" ? raw.magnet : undefined,
      typeof rawgIdRaw === "number" || typeof rawgIdRaw === "string" ? rawgIdRaw : null,
      index,
    ),
    name: typeof raw.name === "string" ? raw.name : "Untitled Game",
    genres,
    platforms,
    platform_type: typeof raw.platform_type === "string" ? raw.platform_type : undefined,
    background_image: typeof raw.background_image === "string" ? raw.background_image : undefined,
    thumbnail: typeof raw.thumbnail === "string" ? raw.thumbnail : undefined,
    screenshots: Array.isArray(raw.screenshots) ? (raw.screenshots as string[]) : undefined,
    description: typeof raw.description === "string" && raw.description.length > 0 ? raw.description : undefined,
    release_date: typeof raw.release_date === "string" ? raw.release_date : undefined,
    metacritic,
    size: typeof raw.size === "string" ? raw.size : undefined,
    magnet: typeof raw.magnet === "string" ? raw.magnet : undefined,
    version: typeof raw.version === "string" ? raw.version : undefined,
    original_torrent_name: typeof raw.original_torrent_name === "string" ? raw.original_torrent_name : undefined,
    is_wine_bottled_torrent: raw.is_wine_bottled_torrent === true,
    is_native_linux_torrent: raw.is_native_linux_torrent === true,
    languages_info: typeof raw.languages_info === "string" ? raw.languages_info : undefined,
    release_group: typeof raw.release_group === "string" ? raw.release_group : undefined,
    extracted_appid: typeof raw.extracted_appid === "number" ? raw.extracted_appid : null,
    rawg_id: typeof raw.rawg_id === "number" ? raw.rawg_id : undefined,
    rawg_name: typeof raw.rawg_name === "string" ? raw.rawg_name : undefined,
    other_torrent_tags: Array.isArray(raw.other_torrent_tags) ? (raw.other_torrent_tags as string[]) : undefined,
  }
}

async function fetchGames(): Promise<Game[]> {
  const res = await fetch(GAMES_URL, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`Failed to load game catalog: ${res.status}`)
  const raw = (await res.json()) as unknown[]
  return raw.map((entry, index) => normalizeGame(entry as Record<string, unknown>, index))
}

export async function getGames(): Promise<Game[]> {
  const now = Date.now()
  if (cache && now - cache.at < TTL_MS) return cache.games

  try {
    const games = await fetchGames()
    cache = { at: now, games }
    return games
  } catch (error) {
    if (cache) return cache.games
    throw error
  }
}

export async function getGameById(id: string): Promise<Game | null> {
  const games = await getGames()
  return games.find((game) => game.id === id) || null
}

export function computeStats(games: Game[]): CatalogStats {
  let nativeLinux = 0
  let magnetLinks = 0
  let ratingSum = 0
  let ratingCount = 0

  for (const game of games) {
    if (game.is_native_linux_torrent) nativeLinux += 1
    if (typeof game.magnet === "string" && game.magnet.length > 0) magnetLinks += 1
    if (typeof game.metacritic === "number" && game.metacritic > 0) {
      ratingSum += game.metacritic
      ratingCount += 1
    }
  }

  return {
    totalGames: games.length,
    nativeLinux,
    avgRating: ratingCount > 0 ? Number((ratingSum / ratingCount).toFixed(1)) : null,
    magnetLinks,
  }
}

export interface HomeData {
  games: GameSummary[]
  stats: CatalogStats
}

function toSummary(game: Game): GameSummary {
  return {
    id: game.id,
    name: game.name,
    genres: game.genres,
    thumbnail: game.thumbnail || game.background_image || null,
    background_image: game.background_image || null,
    release_date: game.release_date || null,
    metacritic: game.metacritic ?? null,
    size: game.size || null,
    platform_type: game.platform_type || null,
    is_native_linux_torrent: game.is_native_linux_torrent,
    is_wine_bottled_torrent: game.is_wine_bottled_torrent,
    hasMagnet: typeof game.magnet === "string" && game.magnet.length > 0,
    hasDescription: typeof game.description === "string" && game.description.length > 0,
  }
}

export async function getHomeData(): Promise<HomeData> {
  const games = await getGames()
  return {
    games: games.map(toSummary),
    stats: computeStats(games),
  }
}

function releaseTime(value: GameSummary) {
  return value.release_date ? new Date(value.release_date).getTime() : 0
}

export function sortByMetacritic(games: GameSummary[], limit = 15): GameSummary[] {
  return games
    .filter((g) => g.metacritic && g.metacritic > 0)
    .sort((a, b) => (b.metacritic ?? 0) - (a.metacritic ?? 0))
    .slice(0, limit)
}

export function sortByReleaseDate(games: GameSummary[], limit = 15): GameSummary[] {
  return games
    .filter((g) => g.release_date)
    .sort((a, b) => releaseTime(b) - releaseTime(a))
    .slice(0, limit)
}