# NinSys Homepage

Personal portfolio and homepage for [nindroidsystems.com](https://nindroidsystems.com)

## Features

- **Hero constellation** — interactive canvas background with cursor reach and a silver binary drizzle
- **Live Service Status** — real-time monitoring of backend services, with the animated home-lab rack from the brand kit
- **Hosted shelf** — self-hosted and in-progress projects
- **Admin panel** — TOTP-gated control panel at `/admin` (overview, services, site config, hosted, projects, utilities)
- **Admin-Editable Projects** — drag-and-drop ordering with GitHub repository import
- **About Me Page Builder** — visual editor with skill proficiency vials
- **Guest View Mode** — preview the site as a visitor without logging out

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 + TypeScript 6 |
| Build Tool | Vite 8 |
| Package Manager | Bun |
| Styling | Tailwind CSS 4 (CSS-first config) |
| Data layer | TanStack Query 5 |
| Animation | Framer Motion |
| Drag & Drop | @dnd-kit |
| Icons | Lucide React |
| Routing | React Router DOM 7 |
| Lint + format | Biome |
| Tests | Bun's built-in test runner (`bun test`) |

Tailwind 4 is configured CSS-first — design tokens live in `src/index.css` and there is
no `tailwind.config.js`.

## Getting Started

```bash
bun install
bun run dev        # http://localhost:3000 (bound to all interfaces)
bun run build      # typecheck + production bundle
bun run typecheck
bun run lint       # biome check
bun test           # unit tests (*.test.ts next to the code)
```

The frontend expects the backend API at `http://localhost:3001` in development.

## Project Structure

```
src/
├── _archive/         # Retired features (terminal, railways) — excluded from build/lint/typecheck
├── assets/           # Static data (navigation cards, hosted projects)
├── components/
│   ├── about/        # About page components (SkillVial, SectionCard, …)
│   ├── admin/        # Admin UI (login modal, guest banner, TOTP input)
│   ├── background/   # BackgroundNet hero canvas
│   ├── projects/     # Projects page components (cards, modals, drag list)
│   ├── shared/ui/    # Older generic primitives (Button, Card, Section, Grid, Badge)
│   └── ui/           # Current v2 primitives (GlassPanel, Wordmark)
├── context/          # React context providers (Auth, SiteConfig)
├── hooks/            # Custom React hooks
├── lib/              # TanStack Query client
├── pages/            # Route pages, plus pages/admin/ for the panel
├── types/            # TypeScript interfaces
└── utils/            # API client and helpers
```

## Routes

| Path | Description |
|------|-------------|
| `/` | Homepage — hero, service status, hosted shelf, nav cards |
| `/projects` | Portfolio project showcase (admin-editable inline) |
| `/about` | Personal bio and skills (admin-editable inline) |
| `/admin/*` | Admin panel (TOTP-gated) |
| `*` | 404 |

`/terminal` and `/railways` were retired to `src/_archive/`; see
[`src/_archive/README.md`](./src/_archive/README.md) before restoring either.

## API Integration

The frontend communicates with a backend API for:
- Project CRUD operations
- About page data management
- GitHub repository fetching
- TOTP authentication
- Service health monitoring

API URLs are automatically detected based on environment (localhost for dev, production domain for prod).

## Contributing

Work happens on `feat/*` or `chore/*` branches that PR into `main`. CI runs
`bun test`, `bunx biome ci --error-on-warnings .` and `bun run build` on every
pull request; merging to `main` builds a Docker image and deploys it to the
homelab.

## Recent Changes

See [CHANGELOG.md](./CHANGELOG.md) for version history.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
