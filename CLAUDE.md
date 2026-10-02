# ns-homepage

<!-- Claude reads this file at the start of every session in this repo. Keep it short and factual.
     cozmo-ops can fill in the TODOs: "read the repo and complete CLAUDE.md". -->

## What this is
TODO: one paragraph. What it does, who uses it, where it runs.

## Commands
| Task | Command |
| --- | --- |
| Install | `bun install` |
| Dev | `bun run dev` |
| Test | none yet; CI runs lint + build |
| Lint / typecheck | `bun run lint` (CI: `bunx biome ci --error-on-warnings .`), `bun run typecheck` |
| Build | `bun run build` |

## Layout
TODO: the 5–10 directories or files that matter and what lives in them.

## Conventions
- Conventional commits (`feat:`, `fix:`, `chore:` …)
- Every PR bumps `version` in `package.json` and adds a `CHANGELOG.md` entry (Keep a Changelog)
- Detailed code conventions live in `.github/copilot-instructions.md`
- Dependency updates come from Renovate (`renovate.json`), not Dependabot

## How Andrew tests changes
TODO: e.g. "run the bot against the test guild", "open the dev server and check pages X and Y"

## Don't
- Don't touch deploy workflows or production config without an explicit ask
- TODO
