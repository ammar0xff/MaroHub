# MaroHub

A game discovery hub for Linux: browse, filter, and grab ready-to-run games via magnet links. No ads, no accounts, no tracking.

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

---

## What it does

- **Browse the catalog:** filter by genre, year, rating, or download size; search by name.
- **Magnet links:** download directly with any torrent client (qBittorrent, Transmission, and so on).
- **Native + Wine/Proton badges:** know at a glance whether a game runs natively or needs a compatibility layer.
- **Privacy by design:** wishlist lives in your browser and never leaves it.

## Getting started

### Requirements

- Node.js 22+ and [pnpm](https://pnpm.io) 9+

### Run locally

```bash
pnpm install
pnpm dev
```

Open **http://localhost:3000**.

### Static export

The app is a fully static Next.js export (no servers or runtime fetch):

```bash
pnpm build   # writes the static site to out/
```

## Deployment

GitHub Actions deploys the static export to GitHub Pages on every push to `main`
(see `.github/workflows/deploy.yml`). The site lives at:

- **https://ammar0xff.github.io/MaroHub/**

The build must be served from the `/MaroHub` base path. Set it for local
previews of the export:

```bash
NEXT_PUBLIC_BASE_PATH=/MaroHub pnpm build && pnpm dlx serve out
```

## Project structure

```
MaroHub/
├── app/                  # Next.js App Router routes (home, game detail, docs, download)
├── components/           # React components
├── lib/                  # Data layer, sanitizer, wishlist, formatting
├── types/                # TypeScript types
├── public/               # Static assets (icons)
├── data/                 # games.json catalog + backups/
├── CLI/                  # Maro CLI tool (maro script + build.sh)
├── DESIGN.md             # Design system and direction
├── next.config.mjs       # Next.js configuration (static export + base path)
├── .github/workflows/    # GitHub Pages deployment
└── package.json
```

## Maro CLI

A terminal tool for the same catalog:

```bash
cd CLI
./maro help
```

See the **Documentation** page in the app (`/docs`) for the CLI reference, FAQ,
and contributing guide.

## Data & content

- **`data/games.json`** is the catalog. Every game boots the app with its stats, genres, ratings, and magnet link.
- **`backups/games.json.bak`** is the rollback snapshot:

```bash
cp backups/games.json.bak data/games.json
```

## Design

The visual language, palette, and rules are documented in [DESIGN.md](./DESIGN.md).

---

## Connect with the creator

- **Ammar Mohamed** ([ammar0xf](https://github.com/ammar0xff))
- Email: [ammar0xf@gmail.com](mailto:ammar0xf@gmail.com)

---

> MaroHub is built for the Linux community. No ads. No nonsense. Just games.