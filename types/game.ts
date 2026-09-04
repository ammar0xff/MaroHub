export interface Game {
  id: string
  name: string
  genres: string[]
  platforms?: {
    name: string
    requirements?: {
      minimum?: string
      recommended?: string
    }
  }[]
  platform_type?: string
  background_image?: string
  thumbnail?: string
  screenshots?: string[]
  description?: string
  release_date?: string
  metacritic?: number | null
  size?: string
  magnet?: string
  version?: string
  original_torrent_name?: string
  is_wine_bottled_torrent?: boolean
  is_native_linux_torrent?: boolean
  languages_info?: string
  release_group?: string
  extracted_appid?: number | null
  rawg_id?: number
  rawg_name?: string
  other_torrent_tags?: string[]
}

export interface GameSummary {
  id: string
  name: string
  genres: string[]
  thumbnail: string | null
  background_image: string | null
  release_date: string | null
  metacritic: number | null
  size: string | null
  platform_type: string | null
  is_native_linux_torrent?: boolean
  is_wine_bottled_torrent?: boolean
  hasMagnet: boolean
  hasDescription: boolean
}

export interface CatalogStats {
  totalGames: number
  nativeLinux: number
  avgRating: number | null
  magnetLinks: number
}

export interface FilterState {
  genre: string
  year: string
  metacritic: string
  size: string
  sortBy: string
}

export const DEFAULT_FILTERS: FilterState = {
  genre: "all",
  year: "all",
  metacritic: "all",
  size: "",
  sortBy: "name-asc",
}