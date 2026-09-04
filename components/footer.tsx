import Link from "next/link"
import { Github, Linkedin, Mail, Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/40 bg-card/30 backdrop-blur-sm">
      <div className="mx-auto max-w-[1400px] px-6 py-12 md:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Brand section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold">
                Maro<span className="text-primary">Hub</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your trusted platform for discovering and downloading Linux games. Built with passion for the gaming
              community.
            </p>
          </div>

          {/* Links section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Resources</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/docs" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Documentation
              </Link>
              <Link href="/download" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Download CLI
              </Link>
            </nav>
          </div>

          {/* Connect section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Connect</h3>
            <div className="flex gap-3">
              <Link
                href="https://github.com/ammar0xff"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="https://www.linkedin.com/in/ammar0xf"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link
                href="mailto:ammar0xf@gmail.com"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; 2025 ammar mohamed (ammar0xf). All rights reserved.
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            Made with <Heart className="h-4 w-4 text-destructive fill-current" /> for Linux gamers
          </p>
        </div>
      </div>
    </footer>
  )
}
