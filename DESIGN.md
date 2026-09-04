# MaroHub Design System

## Design Direction

**Register:** brand (distinctiveness is the bar).

MaroHub is the terminal-adjacent confidence of a command-line tool, staged on a dark, calm
nocturnal canvas lit by one focused blue accent. The hero content is not a marketing claim: it is
the real catalog (1,922 games, 1,908 with cover art, 1,922 magnet links) presented without
embellishment. The interface reads like a well-maintained terminal bookcase: dense where it needs
to be, quiet everywhere else.

One-line read: *"A dark single-accent stage that treats the game catalog itself as the visual
hero."*

## Calibration

- **Design variance:** 4/10 — structured and consistent, with select moments of scale (hero type).
- **Motion intensity:** 3/10 — deliberate, short transitions; scroll feels assisted, never kinetic.
- **Visual density:** 5/10 — a balance of airy feature bands and a dense but ordered card grid.
- **Physical scene:** a tinkerer at a desk late at night — dark room, one warm lamp on the tooling,
  one cool screen glow carrying the content. Forces dark-only, high-contrast, restful surfaces.

## Aesthetic System: Minimalist

- Dark-only UI. The page root hard-sets `color-scheme: dark` and locks `className="dark"`.
- No gradients on text. Emphasis comes from scale, weight, and the single accent.
- Background surfaces: `card`, `popover`, `muted` at low alpha over `background` so panels read as
  glass in the dark scene.
- One accent: primary blue `oklch(0.72 0.19 240)`. Destiny/destructive red is reserved strictly
  for wishlist-remove state. Everything else stays tonal.

## Palette (OKLCH, dark only)

| Token            | Value                       | Use                                   |
| ---------------- | --------------------------- | ------------------------------------- |
| `background`     | `oklch(0.08 0.01 240)`      | Page canvas                           |
| `foreground`     | `oklch(0.98 0.005 240)`     | Primary text                          |
| `card`           | `oklch(0.12 0.015 240)`     | Panels, cards, sheets                 |
| `popover`        | `oklch(0.1 0.01 240)`       | Floating menus                        |
| `primary`        | `oklch(0.72 0.19 240)`      | Actions, links, focus ring, active    |
| `primary-foreground` | `oklch(0.08 0.01 240)`  | Text on primary                       |
| `muted`          | `oklch(0.18 0.015 240)`     | Hover fills, disabled, wells          |
| `muted-foreground` | `oklch(0.6 0.01 240)`    | Secondary text                        |
| `secondary`      | `oklch(0.2 0.02 240)`       | Badges, soft buttons                  |
| `accent`         | `oklch(0.25 0.03 240)`      | Hover fills on interactive rows       |
| `destructive`    | `oklch(0.55 0.22 25)`       | Wishlist remove, destructive only     |
| `border`/`input` | `oklch(0.22 0.02 240)` / `oklch(0.2 0.02 240)` | Hairlines           |
| `ring`           | same as `primary`           | Focus rings                           |

Radius: `--radius: 0.875rem` (cards feel soft against a dark field).

## Typography

- **Geist** (body + display), **Geist Mono** (accents) from `next/font/google`.
- Scale approach: 1.25 ratio, body floor 16px.
- Display moments (hero `text-5xl → text-8xl`) carry the brand voice; everything else stays in a
  restrained type ramp.
- Numeric readouts (stats, scores, sizes) render in the sans with tabular intent, never faked.

## Layout Families

1. **Full-bleed hero band** — search is the entry point; the catalog count is content, not hype.
2. **Stat strip** — four honest numbers: games, native-Linux builds, average rating, magnet links.
3. **Sidebar filters + responsive grid** — flair-free data filtering with labeled selects.
4. **Horizontal scroll rows** — top-rated and recently-added; keyboard scrollable, reduced-motion aware.
5. **Alternating two-column detail bands** — game facts, description, requirements, media.

## Motion & Interaction

- Transitions at `150–300ms`; hover lift on cards `-translate-y-2` with a primary-tinted shadow.
- Scroll rows use smooth behavior only when the user has not requested reduced motion; otherwise `auto`.
- Global `prefers-reduced-motion: reduce` block collapses animation durations.
- Every interactive element has `focus-visible` rings in primary; nothing relies on hover alone.

## Accessibility

- Skip link to `#main-content` on first focus.
- Landmark structure: `nav`, `main`, `footer`, plus `section`/`aside` with labeled regions for the
  carousels.
- Wishlist toggles expose `aria-pressed` + `aria-label`; state is never color-only.
- Touch targets ≥ 40px (44/48px on primary controls).
- Description and system-requirement HTML is allowlist-sanitized before render.

## Anti-Slop Rules

- **No gradient text.**
- **No fabricated metrics** — every number on the page derives from the live catalog.
- **No color-only state cues.**
- **No hover-only controls** — wishlist hearts are always visible and hit-testable.
- **No decorative blobs/orbs** — atmosphere comes from the grid texture, not floating shapes.
- **No em-dash ad-copy** in UI strings; honest, plain sentence copy.

## Change Log

- Moved all catalog fetches server-side (single hourly TTL cache) and pass lean summaries to the
  client, replacing three 10MB client fetches.
- Replaced index-based IDs with magnet-hash-derived stable ids (`btih:<hash>`, `rawg-<id>`,
  `idx-<index>` fallbacks) so links survive catalog edits.
- Replaced fabricated hero/download numbers with real catalog stats and real CLI install steps.
- Replaced hotlinked `icons8` logo and `via.placeholder` fallbacks with local `public/icon.svg`.
- Removed the navbar 1-second poll in favor of a `CustomEvent` broadcast on wishlist writes.
- Deleted dead `styles/globals.css`, `theme-provider.tsx`, `advanced-search.tsx`, and the unused
  `next-themes` dependency; dropped `typescript.ignoreBuildErrors` and stale image remote patterns.