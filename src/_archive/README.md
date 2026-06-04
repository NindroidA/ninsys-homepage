# Archived features

Code retired from the live site but intentionally kept for possible revival.
**Excluded from the build, type-check, and lint** (see `tsconfig.json` `exclude`,
`biome.json` `files.includes`), so nothing here ships in the bundle.

- `terminal/` — the interactive terminal page + its command/format assets, plus the
  Govee smart-light client it depended on (`goveeAPI.ts`, `govee.ts`, `goveePresets.ts`).
- `railways/` — the interactive minecart page.

Because these files are not type-checked, their relative imports may be stale. To
restore a feature, move it back under `src/`, fix its import paths, and re-add its
route (`src/pages/index.tsx`) and nav entry (`src/components/Navbar.tsx`).
