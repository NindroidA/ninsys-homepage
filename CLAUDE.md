# ns-homepage

<!-- Claude reads this file at the start of every session in this repo. Keep it short and factual. -->

## What this is
Andrew's personal portfolio and homelab front door, live at https://nindroidsystems.com. A
React 19 + TypeScript single-page app (Vite 8, Tailwind 4, TanStack Query) with a homepage (hero,
live service status, Hosted shelf, nav cards), `/projects`, `/about` and a TOTP-gated admin panel
at `/admin`. Content and service status come from the ninsys-api backend:
`https://api.nindroidsystems.com`, or `http://localhost:3001` when the page is served from
`localhost`. Every merge to `main` builds a Docker image (nginx serving `dist/`) and deploys it to
the homelab, behind Cloudflare.

## Commands
| Task | Command |
| --- | --- |
| Install | `bun install` |
| Dev | `bun run dev` |
| Test | `bun test` (unit tests for pure logic, `*.test.ts` next to the code; no DOM) |
| Lint / typecheck | `bun run lint` (CI: `bunx biome ci --error-on-warnings .`), `bun run typecheck` |
| Build | `bun run build` |

## Layout
| Path | What lives there |
| --- | --- |
| `src/pages/` | Route pages and the router; `admin/` is the lazy-loaded admin panel |
| `src/components/` | Page parts (navbar, footer, service status, Hosted shelf) plus feature folders (`about/`, `admin/`, `projects/`, `background/`); current primitives in `ui/`, older ones in `shared/ui/` |
| `src/hooks/`, `src/context/`, `src/lib/` | Hooks (data fetching via TanStack Query), the auth and site-config providers, the shared query client |
| `src/utils/` | API client and API origin, `cn`, icon lookups |
| `src/types/`, `src/assets/` | Shared types; static data (Hosted shelf, nav cards) and the self-hosted fonts |
| `src/index.css` | Tailwind 4 theme and design tokens (there is no `tailwind.config.js`) |
| `src/_archive/` | Retired pages (terminal, railways), excluded from typecheck, lint and build |
| `public/` | Favicons and app icons, `site.webmanifest`, `og-image.png`, `robots.txt`, `sitemap.xml` |
| `.github/workflows/` | `ci.yml` (PR checks) and `deploy.yml` (push to `main` → image on ghcr.io → homelab) |
| `Dockerfile`, `nginx.conf` | The production image: Bun builds `dist/`, nginx serves it |

## Conventions
- Conventional commits (`feat:`, `fix:`, `chore:` …)
- Every PR bumps `version` in `package.json` and adds a `CHANGELOG.md` entry (Keep a Changelog)
- Detailed code conventions live in `.github/copilot-instructions.md`
- Dependency updates come from Renovate (`renovate.json`), not Dependabot

## How Andrew tests changes
- `bun run dev`, open http://localhost:3000 and check `/`, `/projects`, `/about` and a made-up URL
  (404), on desktop and at phone width. Anything visible on the homepage needs his eyes before merge.
- On `localhost` the site calls the API at `http://localhost:3001`; without ninsys-api running
  there, the API and Cogworks show offline and `/projects` and `/about` show a load error. The dev
  server also listens on the LAN, but from another device the hostname isn't `localhost`, so it
  uses the production API.
- `/admin` on `localhost` offers a dev login (fake token, no API call). That is enough to look at
  the admin UI; saving needs the real API and a TOTP login.
- `bun run build && bun run preview` checks the production bundle (code-split routes, lazy admin).

## Don't
- Don't touch deploy workflows or production config (`deploy.yml`, `Dockerfile`, `nginx.conf`)
  without an explicit ask: every merge to `main` deploys the live site
- Don't replace an icon in `public/` without bumping the `?v=` on its links in `index.html` and
  `site.webmanifest`; Cloudflare and browsers keep serving the old copy otherwise
- Don't import from `src/_archive/`: it isn't typechecked, linted or built
- Don't add npm, yarn or pnpm lockfiles; `bun.lock` is the only one
- Don't statically import anything that loads `src/utils/apiBase.ts` in a test: it reads `window`
  at import time and Bun has no `window`. Stub it and use a dynamic import, like the existing tests
