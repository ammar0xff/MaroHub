"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { readWishlist, writeWishlist } from "@/lib/wishlist"
import { cn } from "@/lib/utils"

interface WishlistButtonProps {
  gameId: string
  size?: "sm" | "md" | "lg"
}

const SIZE_CLASSES: Record<string, string> = {
  sm: "h-10 w-10 rounded-full",
  md: "h-11 w-11 rounded-full",
  lg: "h-12 w-12 rounded-full",
}

const ICON_SIZES: Record<string, string> = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
}

export function WishlistButton({ gameId, size = "md" }: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false)

  useEffect(() => {
    setIsInWishlist(readWishlist().includes(gameId))
  }, [gameId])

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const current = readWishlist()
    const next = isInWishlist ? current.filter((id) => id !== gameId) : [...current, gameId]
    writeWishlist(next)
    setIsInWishlist(!isInWishlist)
  }

  return (
    <Button
      onClick={toggleWishlist}
      size="icon"
      variant="outline"
      aria-pressed={isInWishlist}
      aria-label={isInWishlist ? `Remove ${gameId} from wishlist` : `Add ${gameId} to wishlist`}
      title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        SIZE_CLASSES[size],
        "backdrop-blur-sm shrink-0 transition-colors",
        isInWishlist
          ? "bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500/30"
          : "bg-background/80 border-border/50 hover:border-primary hover:text-primary",
      )}
    >
      <Heart className={cn(ICON_SIZES[size], isInWishlist && "fill-current")} />
    </Button>
  )
}