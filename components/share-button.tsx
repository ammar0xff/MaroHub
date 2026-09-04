"use client"

import { useState } from "react"
import { Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ShareButtonProps {
  gameId: string
  gameName: string
  size?: "default" | "lg"
}

export function ShareButton({ gameId, gameName, size = "default" }: ShareButtonProps) {
  const [shareSuccess, setShareSuccess] = useState(false)

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: gameName ? `${gameName} on MaroHub` : "MaroHub",
          text: gameName ? `Check out ${gameName} on MaroHub` : "Check out MaroHub",
          url,
        })
      } catch (err) {
        console.log("Share cancelled or failed", err)
      }
    } else {
      try {
        await navigator.clipboard.writeText(url)
      } catch (err) {
        console.log("Clipboard unavailable", err)
      }
      setShareSuccess(true)
      setTimeout(() => setShareSuccess(false), 2000)
    }
  }

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      size={size}
      aria-label={shareSuccess ? "Link copied" : `Share ${gameName}`}
      className={`gap-2 backdrop-blur-sm bg-background/80 border-border/50 ${size === "lg" ? "h-12 px-6" : ""}`}
    >
      <Share2 className="h-5 w-5" />
      {shareSuccess ? "Copied!" : "Share"}
    </Button>
  )
}