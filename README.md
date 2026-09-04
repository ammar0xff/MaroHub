# MaroHub 🎮

The ultimate game discovery and download hub, built with ❤️ for Linux users and open-source enthusiasts.

[![Next.js](https://img.shields.io/badge/Next.js-19-000000?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

---

## Who is MaroHub for?

- **Linux gamers** who want a smooth, modern way to find and download games.
- Anyone tired of clunky, ad-filled game sites and looking for a clean, fast, and privacy-friendly experience.
- Users who want a one-stop shop for browsing, filtering, and grabbing games via magnet links.

## Why MaroHub rocks

- **No-nonsense browsing:** Instantly filter by genre, year, or rating. Find what you want, fast.
- **Magnet link ready:** Download games directly with your favorite torrent client (like qBittorrent).
- **Modern stack:** Next.js 19 + TypeScript + Tailwind CSS — fast, typed, and easy to extend.
- **Step-by-step guide:** New to torrents? Check out the `docs/` pages — written with Linux in mind.
- **Mobile & desktop friendly:** Looks great on any device, any distro.
- **Open, accessible, and ad-free:** No logins, no tracking, just games.

---

## Getting Started

### Requirements

- Node.js 20+ (or any [pnpm](https://pnpm.io) >= 9 setup)
- A torrent client (e.g. qBittorrent) for magnet downloads

### Run locally

```bash
# 1. Install dependencies
pnpm install

# 2. Start the dev server
pnpm dev
```

Open **http://localhost:3000**.

### Production build

```bash
pnpm build   # Next.js production build → .next/
pnpm start   # Serve the production build
```

### Lint

```bash
pnpm lint
```

---

## Project Structure

```
MaroHub/
├── app/                  # Next.js App Router pages & routes
│   ├── docs/             # How-to and guide pages
│   ├── download/         # Download / CLI page
│   ├── game/             # Game detail pages
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home (browse & filter)
├── components/           # React components (UI + feature)
├── lib/                  # Shared utilities & data helpers
├── types/                # TypeScript types
├── public/               # Static assets (icons, images)
├── styles/               # Global styles
├── css/                  # Legacy static styles
├── js/                   # Legacy static scripts
├── data/                 # Game dataset & settings
│   ├── games.json        # Game catalog (magnet links, genres, ratings)
│   └── settings.json     # Site settings
├── docs/                 # Static HTML guides (CLI, FAQ, contributing)
├── CLI/                  # Maro CLI tool
│   ├── maro              # The CLI script
│   ├── build.sh          # CLI build script
│   └── test.py           # CLI tests
├── backups/              # data/ rollback snapshots
├── index.html            # Legacy static homepage
├── game-detail.html      # Legacy static game page
├── download-cli.html     # Legacy static CLI page
├── components.json       # shadcn/ui configuration
├── next.config.mjs       # Next.js configuration
├── tsconfig.json         # TypeScript configuration
└── package.json
```

---

## Maro CLI

MaroHub ships with a lightweight CLI for browsing and downloading games from the terminal:

```bash
cd CLI
./maro --help
```

See `docs/cli.html` for the full guide.

---

## Data & Content

- **`data/games.json`** — the full catalog. Add games here and they appear in the app automatically.
- **`data/settings.json`** — site-level configuration.
- **`backups/games.json.bak`** — rollback snapshot of the catalog. Restore with:

```bash
cp backups/games.json.bak data/games.json
```

---

## Useful Links

- [How to Download Games](docs/getting-started.html)
- [Maro CLI Guide](docs/cli.html)
- [FAQ](docs/faq.html)
- [Contribute](docs/contributing.html)
- [Contact](docs/contact.html)

---

## Project History

> **2025 rebuild:** MaroHub was originally a static HTML/CSS/JS site. It has been rebuilt as a
> Next.js + TypeScript + Tailwind application. The static pages (`index.html`, `docs/`, `CLI/`,
> `data/`) are kept for reference and compatibility; the Next.js app in `app/` is the current
> frontend. This repository is the single merged home for both generations of the project.

---

## Connect with the creator

- **Ammar Mohamed** ([ammar0xf](https://github.com/ammar0xff))
- Email: [ammar0xf@gmail.com](mailto:ammar0xf@gmail.com)
- GitHub: [ammar0xff](https://github.com/ammar0xff)
- LinkedIn: [ammar0xf](https://www.linkedin.com/in/ammar0xf)

---

> MaroHub is built for the Linux community.
> No ads. No nonsense. Just games.
> Happy gaming, 🎮