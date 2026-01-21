# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

## [1.3.0] - 2024-12-XX

### Added
- Docker containerization with GHCR deployment
- GitHub Actions workflow for automated builds

### Fixed
- Various code quality issues
- Dependency updates

## [1.2.2] - Previous

- Development updates
- See git history for details
