import { Gamepad2, Download, Star, ShieldCheck } from "lucide-react"
import type { CatalogStats } from "@/types/game"

interface QuickStatsProps {
  stats: CatalogStats
}

export function QuickStats({ stats }: QuickStatsProps) {
  const statItems = [
    { icon: Gamepad2, label: "Games in Catalog", value: stats.totalGames.toLocaleString() },
    { icon: ShieldCheck, label: "Native Linux", value: stats.nativeLinux.toLocaleString() },
    { icon: Star, label: "Average Rating", value: stats.avgRating !== null ? `${stats.avgRating}/100` : "N/A" },
    { icon: Download, label: "Magnet Links", value: stats.magnetLinks.toLocaleString() },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
      {statItems.map((stat) => (
        <div
          key={stat.label}
          className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 md:p-6 hover:border-primary/50 transition-colors"
        >
          <div className="flex items-start justify-between mb-2.5 md:mb-3">
            <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 text-primary">
              <stat.icon className="h-5 w-5 md:h-6 md:w-6" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold mb-1 tabular-nums truncate">{stat.value}</p>
          <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}