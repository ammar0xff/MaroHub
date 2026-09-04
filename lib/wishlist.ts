export const WISHLIST_STORAGE_KEY = "marohub-wishlist"
export const WISHLIST_EVENT = "marohub:wishlist"

export function readWishlist(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(String).filter(Boolean)
  } catch {
    return []
  }
}

export function writeWishlist(ids: string[]): void {
  window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(ids))
  window.dispatchEvent(new CustomEvent(WISHLIST_EVENT))
}