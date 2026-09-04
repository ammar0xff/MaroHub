"use client"

import Link from "next/link"
import Image from "next/image"
import { Menu, X, Download, BookOpen, Heart } from "lucide-react"
import { useState, useEffect } from "react"
import { readWishlist, WISHLIST_EVENT } from "@/lib/wishlist"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [wishlistCount, setWishlistCount] = useState(0)

  useEffect(() => {
    const updateWishlistCount = () => {
      setWishlistCount(readWishlist().length)
    }

    updateWishlistCount()
    window.addEventListener(WISHLIST_EVENT, updateWishlistCount)
    window.addEventListener("storage", updateWishlistCount)

    return () => {
      window.removeEventListener(WISHLIST_EVENT, updateWishlistCount)
      window.removeEventListener("storage", updateWishlistCount)
    }
  }, [])

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Image
              src="/icon.svg"
              alt="MaroHub"
              width={28}
              height={28}
              unoptimized
              className="group-hover:scale-110 transition-transform"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-foreground tracking-tight">
              Maro<span className="text-primary">Hub</span>
            </span>
            <span className="text-[10px] text-muted-foreground -mt-1">Linux Gaming Platform</span>
          </div>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/#wishlist"
            className="group relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-accent hover:text-accent-foreground"
          >
            <Heart className="h-4 w-4 transition-transform group-hover:scale-110" />
            Wishlist
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            href="/docs"
            className="group flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-accent hover:text-accent-foreground"
          >
            <BookOpen className="h-4 w-4 transition-transform group-hover:scale-110" />
            Documentation
          </Link>
          <Link
            href="/download"
            className="group flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/30 hover:scale-105"
          >
            <Download className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
            Get CLI
          </Link>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden rounded-lg p-2 hover:bg-accent transition-colors"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border/40 bg-background/95 backdrop-blur-xl md:hidden animate-in slide-in-from-top-2">
          <div className="space-y-2 px-6 py-4">
            <Link
              href="/#wishlist"
              className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-foreground hover:bg-accent transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Heart className="h-4 w-4" />
              Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
            </Link>
            <Link
              href="/docs"
              className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-foreground hover:bg-accent transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <BookOpen className="h-4 w-4" />
              Documentation
            </Link>
            <Link
              href="/download"
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Download className="h-4 w-4" />
              Get CLI
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}