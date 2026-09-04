"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Download, BookOpen, Heart, LayoutGrid } from "lucide-react"
import { useEffect, useState } from "react"
import { readWishlist, WISHLIST_EVENT } from "@/lib/wishlist"

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ""

const TAB_ITEMS = [
  { href: "/", label: "Catalog", icon: LayoutGrid },
  { href: "/#wishlist", label: "Wishlist", icon: Heart },
  { href: "/docs", label: "Docs", icon: BookOpen },
  { href: "/download", label: "CLI", icon: Download },
]

export function Navbar() {
  const pathname = usePathname()
  const [wishlistCount, setWishlistCount] = useState(0)
  const [activeTab, setActiveTab] = useState(getActiveTab(pathname, undefined))

  useEffect(() => {
    const updateWishlistCount = () => setWishlistCount(readWishlist().length)
    const syncHash = () => setActiveTab(getActiveTab(pathname, window.location.hash))

    updateWishlistCount()
    syncHash()
    window.addEventListener(WISHLIST_EVENT, updateWishlistCount)
    window.addEventListener("storage", updateWishlistCount)
    window.addEventListener("hashchange", syncHash)

    return () => {
      window.removeEventListener(WISHLIST_EVENT, updateWishlistCount)
      window.removeEventListener("storage", updateWishlistCount)
      window.removeEventListener("hashchange", syncHash)
    }
  }, [pathname])

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 md:h-20 max-w-[1400px] items-center justify-between px-4 md:px-8">
          <Link href="/" className="flex items-center gap-2.5 md:gap-3 group" aria-label="MaroHub home">
            <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Image
                src={`${BASE_PATH}/icon.svg`}
                alt=""
                width={28}
                height={28}
                unoptimized
                className="group-hover:scale-110 transition-transform"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-bold text-foreground tracking-tight leading-none">
                Maro<span className="text-primary">Hub</span>
              </span>
              <span className="hidden md:inline text-[10px] text-muted-foreground mt-1">Linux Gaming Platform</span>
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
        </div>
      </nav>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/40 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 md:hidden"
        aria-label="Primary"
      >
        <div className="mx-auto grid max-w-md grid-cols-4 pb-[env(safe-area-inset-bottom)]">
          {TAB_ITEMS.map((tab) => {
            const active = activeTab === tab.label
            return (
              <Link
                key={tab.label}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-[52px] flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors active:bg-accent/50 ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="relative">
                  <tab.icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                  {tab.label === "Wishlist" && wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                      {wishlistCount}
                    </span>
                  )}
                </span>
                {tab.label}
                <span
                  className={`absolute top-0 h-0.5 w-10 rounded-full bg-primary transition-opacity ${
                    active ? "opacity-100" : "opacity-0"
                  }`}
                />
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}

function getActiveTab(pathname: string, hash: string | undefined): string {
  if (pathname === "/download") return "CLI"
  if (pathname === "/docs" || pathname.startsWith("/docs/")) return "Docs"
  if (pathname === "/" && hash === "#wishlist") return "Wishlist"
  return "Catalog"
}