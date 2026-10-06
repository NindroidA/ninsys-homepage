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

- [ ] Prerender/SSG so crawlers get per-route metadata and unknown URLs can
      return a real 404 status instead of a soft 404.

## Done

- [x] The WebGL rack, and with it drei's runtime HDRI fetch from
      `raw.githack.com`, replaced by the animated home-lab rack (#87)
- [x] `motion` off the homepage's critical path: CSS entrance animations, a
      lazy login dialog, and React out of the `motion` chunk (#87, #91)
- [x] Tests. `bun test` runs unit tests for the pure logic (`cn`, the icon
      lookups, the API origin and error messages, uptime formatting and the
      service-status mapping, site-config reconciliation), in CI too (#85)
- [x] PNG + maskable icons for `site.webmanifest` (`icon-192.png` and
      `icon-512.png`, the 512 also as `maskable`) and an `apple-touch-icon` (#77)
- [x] Fix the 404 page formatting — rebuilt on the v2 glass system (#38)
- [x] Cogworks Bot API integration
- [x] Replace ESLint with Biome (v2.0.0)
