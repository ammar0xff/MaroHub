# Product

## Register

brand

## Users
- Linux gamers who want a fast, modern, no-nonsense way to discover and download games.
- Open-source enthusiasts and users tired of clunky, ad-heavy game sites.
- People who browse by genre, year, or rating and download via magnet links with a torrent client like qBittorrent.

## Product Purpose
MaroHub is a game discovery and download hub built for the Linux community. It makes finding and grabbing open games feel effortless: filter the catalog, open a game, pull the magnet link, done. Success means a community that trusts the site as the clean, ad-free, privacy-friendly place to find games, and a catalog that keeps growing.

## Brand Personality
Friendly, direct, community-first. Voice is helpful and casual but never gimmicky. The emotional goal is confidence without corporate gloss: a terminal-adjacent, open-source warmth that says, this was built by someone like you, for you.

## Anti-references
- Ad-crammed, popup-heavy game download sites with fake download buttons.
- Corporate launcher bloat and storefront noise (huge banner sliders, purple "next-gen" gradients).
- AI-generated SaaS landing cliches: cream/sand backgrounds, three identical feature cards, Inter by reflex, em-dash-laden copy.
- Generic stock gaming imagery with no connection to the actual catalog.

## Design Principles
- Linux-first: honor the audience with technical candor, terminal-aware touches, and zero dark patterns.
- Show, don't tell: the game catalog is the content, surfaced through real data from `data/games.json`, never fake metrics.
- Fast is a feature: instant filters, lazy-loaded images, minimal JS. Respect the machines and networks of the audience.
- Open and ad-free by default: no login, no tracking, no bait.
- One strong accent, strong typography, generous but purposeful spacing. Trust the games to carry the page.

## Accessibility & Inclusion
- Aim for WCAG 2.2 AA: body text contrast 4.5:1, visible focus rings, keyboard-navigable filters, skip link to main content.
- Respect `prefers-reduced-motion`: reduce movement, keep opacity/color transitions.
- Support color-blind-friendly state cues beyond color alone (text/icon alongside any colored indicator).
- Touch targets at least 44x44px on mobile; responsive down to 320px with no horizontal scroll.