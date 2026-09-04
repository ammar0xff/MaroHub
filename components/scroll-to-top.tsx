"use client"

import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300)
    }

    window.addEventListener("scroll", toggleVisibility, { passive: true })
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })
  }

  if (!isVisible) return null

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      aria-label="Back to top"
      className="fixed bottom-24 right-4 md:bottom-8 md:right-8 h-12 w-12 md:h-14 md:w-14 rounded-full shadow-2xl shadow-primary/20 z-50 hover:scale-110 transition-transform focus-visible:ring-2 focus-visible:ring-primary"
    >
      <ArrowUp className="h-5 w-5 md:h-6 md:w-6" />
    </Button>
  )
}