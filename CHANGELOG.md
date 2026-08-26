# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2026-08-26

### Fixed

**Hero background canvas**
- Cursor reach was offset by the scroll position. The canvas is absolutely positioned inside the hero, but pointer events stored raw viewport coordinates and compared them against canvas-local node positions, so once the page scrolled the highlight trailed the cursor by exactly `scrollY`. Pointer coordinates are now mapped through the canvas origin.
- The highlight no longer freezes in place when the pointer leaves the page.
- Motion speed tracked display refresh rate. Node drift, the binary drizzle's rise and lifetime, and its spawn odds were all per-frame with no delta time, so the scene ran at visibly different speeds on 30/60/120/144Hz displays — a 4.8× span. Motion is now scaled by a delta-time step normalised to 60fps and clamped at ~100ms.

**Mobile layout**
- The site was laid out at desktop scale and merely shrunk; unprefixed Tailwind values meant a 390px phone got the same paddings, type and gaps as a 1440px desktop. Base-breakpoint values are now phone-sized with the previous values moved to `sm:`/`md:`. Homepage height dropped 31% (5693px → 3922px on an iPhone 14 viewport); Projects dropped 31%.
- The hero reserved a full `min-h-screen` for ~260px of content, and `100vh` overshoots iOS Safari's visible viewport. Now `min-h-[78svh]` on phones.
- The hero eyebrow overflowed its container and wrapped to two lines, stranding the blinking cursor.
- Modals sized themselves with `vh`, which on iOS Safari measures against the chrome-hidden viewport and hid the Save/Cancel row behind the toolbar. Now `dvh`.
- `GuestViewBanner` was `fixed top-0` and overlapped the sticky navbar, covering the Home and Projects icons.
- The Projects admin control row had no `flex-wrap` and overflowed in edit mode.
- The rack poster's orbiting nodes used a hardcoded 80px radius and flew outside the frame once it shrank.

**Correctness**
- The shared `Button` was keyboard-dead: `onClick` sat on an inner `motion.div`, and keyboard activation dispatches its click on the `<button>` itself, which never reaches a descendant handler. Enter and Space did nothing on every `Button` in the app.
- `Button`'s variant union said `"outline-solid"` while the variants map keyed on `"outline"` — a Tailwind v3→v4 codemod artifact that rewrote the string literal as if it were a utility class, so the declared variant emitted `"undefined"` into `className`.
- Reordering projects while a filter was active wrote the filtered subset over the whole query cache and sent a partial id list to the server, dropping the hidden projects.
- `request()` called `response.json()` unconditionally, so a `204 No Content` threw and reported failure for deletes and reorders the server had already applied.
- Token expiry was evaluated once on mount and a 401 never logged the user out, so an expired tab stayed "authenticated" while every mutation silently failed.
- `ErrorBoundary` existed but was never mounted, so any render throw blanked the page.

**Accessibility**
- None of the six modals exposed `role="dialog"`, trapped focus, or restored focus on close, and five could not be closed with Escape. Added a shared `useModalA11y` hook and wired it into all six, along with `aria-modal`, `aria-labelledby`, label/control associations, and accessible names for icon-only buttons. Biome warnings dropped from 95 to 58.

### Added

- `/admin` is now reachable from the UI. It previously had no link anywhere in the app — logging in from the footer left you authenticated on the public page with no route forward. Login now navigates to the panel, the navbar gains an Admin entry while signed in (hidden in guest view), and the footer gets a direct button.
- The Vite dev server binds to all interfaces, so it is reachable when the repo is worked on from a headless machine over SSH.

### Changed

- Documentation resynced with reality: `README.md` and `.github/copilot-instructions.md` described Vite 5, Tailwind 3, ESLint + Prettier and the retired `/terminal` and `/railways` routes.
- `.coderabbit.yaml` steered reviews toward `src/components/shared/ui`, the older primitive kit, rather than the current `src/components/ui`.

### Removed

- The `dev` branch and `auto-pr.yml`. Nothing had flowed through `dev` since January 2026 — every PR from #10 onward went feature-branch → `main` — but the workflow still fired on pushes to it. `dev` was fully contained in `main`, so no history was lost.

## [2.1.0] - 2026-06-05

### Added

**Admin panel** (parts 1–3)
- Panel shell at `/admin` with Overview and Services pages
- `SiteConfig` control plane and an admin Site Config page, letting homepage sections be reordered and hidden (currently persisted per-browser in localStorage; awaiting a `GET`/`PUT /v2/config` endpoint)
- Admin Hosted, Projects and Utilities pages

### Changed

- Shared TOTP input between the login modal and the admin login page
- Locked the 3D rack camera and reworded the hero tagline
- Dependency migrations, each in its own PR: lucide-react 0.577 → 1.x (replacing removed brand icons), Vite 5.4 → 7.3 with `@vitejs/plugin-react` 4 → 5, and Tailwind CSS 3.4 → 4.x (CSS-first config — `tailwind.config.js` is gone, tokens now live in `src/index.css`)

## [2.0.0] - 2026-06-05

### Added

**Design v2 — "terminal-noir"**
- Redesigned homepage hero with the constellation canvas background
- Glass design system (`GlassPanel`) and relocation of the 3D rack into the status section
- Hosted shelf for self-hosted and in-progress projects
- Projects and About pages restyled onto the glass system
- Open Graph image and an on-brand 404 page

### Changed

- Adopted TanStack Query for the data layer
- Replaced ESLint + Prettier with Biome
- Consolidated on a single Bun lockfile; retired the terminal and railways features to `src/_archive/`
- Split Cogworks into bot + dashboard, reclassified Pluginator as a web app, and wired up live statuses
- Performance, mobile, SEO and accessibility passes; TypeScript 6

## [1.5.0] - 2026-01-20

### Added

**API Migration**
- Updated production API base URL from `nindroidsystems.com` to `api.nindroidsystems.com`
- Migrated all API endpoint paths from `/api/*` to `/v2/*` for the new API version

**Systems Status Page**
- Added "Cogworks" web dashboard as a "Coming Soon" service card
- Added "Pluginator" plugin management platform as a "Coming Soon" service card
- Added purple "Coming Soon" status badge to status config
- Removed Govee smart lights integration from service status

**Project Cards - Icon Selection**
- Added optional `icon` field to Project type for custom icons
- Project cards now display selected icon or default folder icon
- Icons displayed with purple gradient background

**Project Edit Modal Improvements**
- Added technology dropdown with 40+ common tech options (React, TypeScript, Node.js, etc.)
- Changed date format from YYYY-MM to "Month Year" with separate dropdowns
- Added "Use repo created date" toggle when importing from GitHub
- Technologies can be searched and selected from dropdown or typed manually
- Category badges now display with capitalization

**Avatar Upload with Preview**
- Added file upload option for avatars (supports images up to 2MB)
- Added real-time preview of avatar (URL or uploaded file)
- Toggle between URL input and file upload modes
- Base64 encoding for uploaded images
- Clear/remove avatar button

**Skills Section (SkillVial) Improvements**
- Removed percentage text display from skill vials
- Added gradient fill to liquid (bottom-to-top color gradient per level)
- Improved wave animation with smoother sine wave motion
- Enhanced cork styling with realistic wood texture and grain lines
- Added bubble pop effect animation on hover (5 bubbles with pop effect)
- Improved glass reflection and highlight effects

### Changed
- All modals now use consistent styling (backdrop blur, borders, padding, z-index hierarchy)
- Status cards show proper labels for all statuses including "Coming Soon"

### Fixed
- Modal styling consistency across all modal components
- Technology dropdown closes on selection or escape key

---

## [1.4.2] - 2025-12-29

### Added

**Documentation & Copilot Prep**
- Comprehensive README.md update
- Added MIT LICENSE
- Created `.github/copilot-instructions.md` for GitHub Copilot code review guidance
- Added JSDoc documentation to key hooks and components:
  - `useProjects` hook with interface documentation
  - `useGitHubRepos` hook with interface documentation
  - `ProjectEditModal` component interfaces
  - `GitHubImportModal` component interfaces and language colors constant
  - `NinsysAPI` class and key methods

**GitHub Actions**
- Added `auto-draft-pr.yml` workflow to auto-create draft PRs when pushing to `dev` branch

---

## [1.4.1] - 2025-12-28

### Fixed

**Projects Page - Import Flow**
- GitHub import now properly opens edit modal first, creating project only on save
- Import detection uses exact repo path matching instead of partial string matching
- Removed "already imported" false positives (e.g., "react" no longer matches "my-react-app")
- Deleted projects no longer show as "Already Imported" in GitHub import modal

**Projects Page - Modal Improvements**
- Added z-index hierarchy to prevent modal stacking issues (GitHub > Edit > Delete)
- Fixed modal navigation: import now closes GitHub modal before opening edit modal
- Added error display in ProjectEditModal for failed save operations
- Save button no longer requires technologies (allows saving with empty tech list)
- Import modal shows "Import & Create" button text for clarity

**Projects Page - Data Persistence**
- Added optimistic update rollback for project reordering (reverts on API failure)
- Rollback works for both drag-and-drop and up/down button reordering

**GitHub Import Modal**
- Added language-specific colors matching GitHub's actual language colors
- Shows star count for all repos (including 0 stars)
- Pre-populates form with repo data: title (Title Case), description, language + topics as technologies
- Clears search when modal closes

**About Page - Skills Editor**
- Added slider UI for editing skill proficiency levels
- Fixed skill vials not rendering when level was invalid (now defaults to 'intermediate')
- Added cork-style stopper to skill vial SVG for potion aesthetic
- Added CSS styling for range slider thumb appearance

**API & Authentication**
- Fixed sessionStorage key mismatch (auth_token vs ninsys_auth_token)
- Fixed Content-Type header being lost in API requests due to spread order bug

### Changed
- ProjectEditModal now accepts `initialData` prop for pre-filling from GitHub imports
- GitHubImportModal `onImport` now passes full `GitHubRepo` object instead of just name
- Removed unused `importing` state from useGitHubRepos hook usage

---

## [1.4.0] - 2025-12-28

### Added

**Admin Authentication System**
- Site-wide TOTP authentication via AuthContext
- Subtle login button on homepage (near footer)
- Login modal with 6-digit TOTP input
- Guest View Mode - hide admin UI without logging out (Discord-style)
- Persistent amber "Viewing as Guest" banner
- Session management with auto-expiry

**Projects Page Editor**
- Visual drag-and-drop interface for reordering projects
- Touch-friendly up/down buttons for mobile reordering
- Add/edit/delete project functionality
- GitHub repository import feature
- Project edit modal with full form fields
- Delete confirmation modal with mobile-responsive positioning

**About Me Page Builder**
- Visual page builder with draggable sections
- Touch-friendly up/down buttons for section reordering
- Profile editor (name, tagline, bio, avatar, social links)
- Section types: Skills, Interests, Experience, Education
- Skill proficiency vials with animated liquid effect
- Section edit modals with type-specific forms

**Three.js Optimization**
- Lazy loading for 3D Canvas
- Loading skeleton (ServerRackLoader) while 3D initializes
- Fade-in animation when ready

**Terminal Integration**
- Site authentication syncs with terminal
- `viewguest` command to toggle guest view
- Updated login/logout behavior based on site auth state
- Terminal version bumped to 1.2.0

**API Helpers**
- Retry wrapper with exponential backoff
- Safe fetch with fallback values
- React ErrorBoundary component

**Local UI Component Library**
- Created local shared UI components replacing deprecated @nindroidsystems/ui
- Badge, Button, Card, Grid, Section, FloatingElements components

### Changed
- Footer now includes "Buy Me a Coffee" link
- Removed ping display from Cogworks service card
- Updated CLAUDE.md with new project structure
- Fixed animation patterns (changed whileInView to animate for consistent page load behavior)
- Fixed ServiceStatus empty stats container rendering

### Dependencies Added
- @dnd-kit/core
- @dnd-kit/sortable
- @dnd-kit/utilities

## [1.3.0]

_Release date not recorded; the entry was back-filled during the v1.4.2 docs pass._

### Added
- Docker containerization with GHCR deployment
- GitHub Actions workflow for automated builds

### Fixed
- Various code quality issues
- Dependency updates

## [1.2.2] - Previous

- Development updates
- See git history for details
