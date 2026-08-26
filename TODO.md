# TODO

## Next up

- [ ] **Server-side SiteConfig.** `GET`/`PUT /v2/config` in ninsys-api. Homepage
      section order/visibility and the Hosted shelf overrides currently live in
      `localStorage`, so admin changes only affect the browser that made them —
      the admin Site Config page says as much in an amber notice. The client type
      in `src/types/siteConfig.ts` is already shaped for the endpoint.
- [ ] **Make the Hosted shelf admin-editable.** `src/assets/hostedProjects.ts` is
      a static array; the admin page can only reorder and hide what's already in
      it, not add or edit entries.
- [ ] 'current projects' / 'notable projects' split on the Projects page
- [ ] Decide what the nav cards should be — there are only two today
      (Projects, About). Candidates: GitHub, Resume.
- [ ] devbass — music dev app idea

## Worth doing sometime

- [ ] PNG + maskable icons for `site.webmanifest` (only `favicon.svg` ships today,
      so Android install prompts have no maskable icon) and an `apple-touch-icon`.
- [ ] `ServerRackScene` uses drei's `<Environment preset="studio" />`, which
      fetches an HDRI from `raw.githack.com` at runtime. Consider self-hosting it
      or replacing with plain lights.
- [ ] `motion` is eager on the homepage (~42 kB gzip on the critical path)
      because the hero animates on mount. A CSS-only hero entry animation would
      let the chunk go lazy.
- [ ] Prerender/SSG so crawlers get per-route metadata and unknown URLs can
      return a real 404 status instead of a soft 404.
- [ ] Tests. There is no runner, no test script, and no test files.

## Done

- [x] Fix the 404 page formatting — rebuilt on the v2 glass system (#38)
- [x] Cogworks Bot API integration
- [x] Replace ESLint with Biome (v2.0.0)
