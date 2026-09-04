"use client"

import { Gamepad2, Download, Star, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"

interface Stats {
  totalGames: number
  totalDownloads: string
  avgRating: string
  trending: number
}

export function QuickStats() {
  const [stats, setStats] = useState<Stats>({
    totalGames: 0,
    totalDownloads: "0",
    avgRating: "0",
    trending: 0,
  })

  useEffect(() => {
    fetch("https://raw.githubusercontent.com/ammar0xff/MaroHub/refs/heads/main/data/games.json")
      .then((res) => res.json())
      .then((games: any[]) => {
        const total = games.length
        const withRatings = games.filter((g) => g.metacritic).length
        const avgRating = games.reduce((acc, g) => acc + (g.metacritic || 0), 0) / withRatings

        setStats({
          totalGames: total,
          totalDownloads: `${(total * 1.2).toFixed(0)}K`,
          avgRating: avgRating.toFixed(1),
          trending: Math.floor(total * 0.05),
        })
      })
  }, [])

  const statItems = [
    { icon: Gamepad2, label: "Total Games", value: stats.totalGames.toLocaleString(), color: "text-blue-400" },
    { icon: Download, label: "Downloads", value: stats.totalDownloads, color: "text-green-400" },
    { icon: Star, label: "Avg Rating", value: `${stats.avgRating}/100`, color: "text-yellow-400" },
    { icon: TrendingUp, label: "Trending Now", value: stats.trending, color: "text-purple-400" },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statItems.map((stat, idx) => (
        <div
          key={idx}
          className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:border-primary/50 transition-all group"
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-xl bg-background/50 ${stat.color} group-hover:scale-110 transition-transform`}
            >
              <stat.icon className="h-6 w-6" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{stat.value}</p>
          <p className="text-sm text-muted-foreground">{stat.label}</p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -z-10 group-hover:bg-primary/10 transition-colors" />
        </div>
      ))}
    </div>
  )
}
