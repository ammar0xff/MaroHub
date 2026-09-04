export interface Game {
  uniqueId: number
  name: string
  genres: string[]
  platforms: {
    name: string
    requirements?: {
      minimum?: string
      recommended?: string
    }
  }[]
  platform_type: string
  background_image: string
  thumbnail: string
  screenshots?: string[]
  description: string
  release_date: string
  metacritic: number | null
  size: string
  magnet: string
  version?: string
  original_torrent_name?: string
  is_wine_bottled_torrent?: boolean
  is_native_linux_torrent?: boolean
  languages_info?: string
  release_group?: string
  extracted_appid?: number | null
  rawg_id?: number
  rawg_name?: string
}
