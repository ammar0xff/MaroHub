import Link from "next/link"
import { Gamepad2 } from "lucide-react"

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
        <Gamepad2 className="h-10 w-10 text-primary" />
      </div>
      <h1 className="mb-4 text-5xl font-bold text-foreground">404</h1>
      <p className="mb-8 text-lg text-muted-foreground">This game or page does not exist in the catalog.</p>
      <Link
        href="/"
        className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground hover:shadow-lg hover:shadow-primary/30 transition-all"
      >
        Back to the catalog
      </Link>
    </main>
  )
}