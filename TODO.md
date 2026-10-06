# TODO

## Next up

- [ ] **Make the Hosted shelf entries editable in admin** (add, edit, delete).
      The entries already live in the site config (#98); the editor is next.
- devbass (the music dev app idea) moved to repo-ops `PRIORITIES.md`: it isn't
  homepage work.

## Worth doing sometime

- [ ] Prerender/SSG so crawlers get per-route metadata and unknown URLs can
      return a real 404 status instead of a soft 404. (2026-10-06: not now.
      Worth it once link previews for `/projects` and `/about` matter.)

## Done

- [x] Server-side site config: section order and visibility and the Hosted
      shelf live in ninsys-api (`GET`/`PUT /v2/config`), so admin changes reach
      every visitor (#98)
- [x] Projects page split into Current and Notable sections (#99)
- [x] Nav cards: a GitHub card; no Resume card for now (#99)
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
