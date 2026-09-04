import type { Metadata } from "next"
import { CatalogView } from "@/components/catalog-view"
import { getHomeData, sortByMetacritic, sortByReleaseDate } from "@/lib/games"

export const metadata: Metadata = {
  title: "MaroHub - Linux Games Collection",
  description: "Explore ready-to-run Linux games with magnet download links, no ads and no accounts.",
}

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const { games, stats } = await getHomeData()

  return (
    <CatalogView
      games={games}
      stats={stats}
      topRated={sortByMetacritic(games)}
      recentlyAdded={sortByReleaseDate(games)}
    />
  )
}