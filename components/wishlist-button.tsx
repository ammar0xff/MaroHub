"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WishlistButtonProps {
  gameId: number
  size?: "sm" | "md" | "lg"
}

export function WishlistButton({ gameId, size = "md" }: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false)

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem("marohub-wishlist") || "[]")
    setIsInWishlist(wishlist.includes(gameId))
  }, [gameId])

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const wishlist = JSON.parse(localStorage.getItem("marohub-wishlist") || "[]")
    let newWishlist: number[]

    if (isInWishlist) {
      newWishlist = wishlist.filter((id: number) => id !== gameId)
    } else {
      newWishlist = [...wishlist, gameId]
    }

    localStorage.setItem("marohub-wishlist", JSON.stringify(newWishlist))
    setIsInWishlist(!isInWishlist)
  }

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  return (
    <Button
      onClick={toggleWishlist}
      size="icon"
      variant="outline"
      className={`${sizeClasses[size]} rounded-full backdrop-blur-sm transition-all ${
        isInWishlist
          ? "bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500/30"
          : "bg-background/80 border-border/50 hover:border-primary hover:text-primary"
      }`}
    >
      <Heart className={`${iconSizes[size]} ${isInWishlist ? "fill-current" : ""}`} />
    </Button>
  )
}
