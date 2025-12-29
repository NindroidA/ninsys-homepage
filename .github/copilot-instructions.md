# Copilot Instructions for NinSys Homepage

## Project Overview

React 19 + TypeScript portfolio site with admin features for managing projects and about page content. Uses Vite for building, Tailwind CSS for styling, and Framer Motion for animations.

## Recent Changes to Review (v1.4.1)

This PR includes significant fixes to the Projects page and About page admin functionality:

### Projects Page - Import Flow
- GitHub import now properly opens edit modal first, creating project only on save
- Import detection uses exact repo path matching instead of partial string matching
- Removed "already imported" false positives (e.g., "react" no longer matches "my-react-app")
- Deleted projects no longer show as "Already Imported" in GitHub import modal

### Projects Page - Modal Improvements
- Added z-index hierarchy to prevent modal stacking issues (GitHub > Edit > Delete)
- Fixed modal navigation: import now closes GitHub modal before opening edit modal
- Added error display in ProjectEditModal for failed save operations
- Save button no longer requires technologies (allows saving with empty tech list)
- Import modal shows "Import & Create" button text for clarity

### Projects Page - Data Persistence
- Added optimistic update rollback for project reordering (reverts on API failure)
- Rollback works for both drag-and-drop and up/down button reordering

### GitHub Import Modal
- Added language-specific colors matching GitHub's actual language colors
- Shows star count for all repos (including 0 stars)
- Pre-populates form with repo data: title (Title Case), description, language + topics as technologies
- Clears search when modal closes

### About Page - Skills Editor
- Added slider UI for editing skill proficiency levels
- Fixed skill vials not rendering when level was invalid (now defaults to 'intermediate')
- Added cork-style stopper to skill vial SVG for potion aesthetic
- Added CSS styling for range slider thumb appearance

### API & Authentication
- Fixed sessionStorage key mismatch (auth_token vs ninsys_auth_token)
- Fixed Content-Type header being lost in API requests due to spread order bug

## Key Files Modified in v1.4.1

### Core Components
- `src/pages/Projects.tsx` - Main projects page with admin controls
- `src/components/projects/ProjectEditModal.tsx` - Project add/edit form modal
- `src/components/projects/GitHubImportModal.tsx` - GitHub repo browser and import
- `src/components/projects/ProjectDragList.tsx` - Drag-and-drop project list with rollback
- `src/components/projects/DeleteConfirmModal.tsx` - Delete confirmation with z-index fix

### About Page
- `src/components/about/SkillVial.tsx` - Animated liquid skill meter
- `src/components/about/SectionEditModal.tsx` - Section editor with skill slider

### Hooks
- `src/hooks/useProjects.ts` - Project CRUD operations and state
- `src/hooks/useGithubRepos.ts` - GitHub API integration

### Utilities
- `src/utils/ninsysAPI.ts` - API wrapper with auth header injection

## Coding Conventions

### Components
- Function components with hooks (no class components)
- PascalCase for component files and exports
- Props interfaces defined above component

### Styling
- Tailwind utility classes only (no CSS modules)
- Glassmorphism patterns: `bg-white/5 backdrop-blur-xl border-white/10`
- Color scheme: Purple/indigo gradients, slate backgrounds

### State Management
- React useState/useCallback for local state
- sessionStorage for auth tokens (key: `ninsys_auth_token`)
- No external state library (Redux, Zustand, etc.)

### Animation
- Framer Motion for all animations
- Use `animate` prop, NOT `whileInView` (causes issues on navigation)
- AnimatePresence for enter/exit animations

### TypeScript
- Strict mode enabled
- Explicit return types on exported functions
- Interface over type for object shapes

## Review Checklist

### Code Quality
1. Check for unused imports/variables
2. Validate TypeScript types are correct and complete
3. Look for anti-patterns or code smells
4. Verify consistent naming conventions
5. Check for proper error handling in async functions
6. Ensure no hardcoded values that should be constants

### Bug Hunting - Focus Areas
1. **Modal state management** - Check for race conditions when opening/closing modals
2. **Optimistic updates** - Verify all optimistic updates have proper rollback on failure
3. **z-index hierarchy** - Ensure modals stack correctly (GitHub z-[53] > Edit z-[52] > Delete z-[51])
4. **Null/undefined access** - Look for potential crashes from accessing undefined properties
5. **Async error handling** - Verify try/catch blocks and error state updates
6. **useEffect cleanup** - Check for memory leaks from missing cleanup functions
7. **Key props** - Ensure list items have stable, unique keys

### Specific Areas to Verify
- `handleImportRepo` in Projects.tsx closes GitHub modal before opening edit modal
- `ProjectDragList` stores previous state before optimistic update and rolls back on failure
- `isImported` function uses exact path matching, not partial string match
- `LANGUAGE_COLORS` map covers common languages
- Skill vial defaults to 'intermediate' for invalid levels

## Architecture Notes

### State Flow
```
User Action → Component Handler → Hook Method → API Call → State Update → Re-render
                                                    ↓
                                            Error → Rollback/Display
```

### Modal Pattern
```tsx
<AnimatePresence>
  {isOpen && (
    <>
      <motion.div className="fixed inset-0 bg-black/60 z-50" /> {/* Backdrop */}
      <motion.div className="fixed inset-0 z-[52]"> {/* Modal content */}
        ...
      </motion.div>
    </>
  )}
</AnimatePresence>
```

### API Pattern
```tsx
const api = new NinsysAPI();
// Auth token automatically injected from sessionStorage
const projects = await api.getProjects();
```

### Drag-and-Drop Pattern (using @dnd-kit)
```tsx
<DndContext onDragEnd={handleDragEnd}>
  <SortableContext items={itemIds}>
    {items.map(item => <SortableItem key={item.id} />)}
  </SortableContext>
</DndContext>
```

## Files NOT Modified (for context)

These files were previously working and should not need changes:
- `src/context/AuthContext.tsx` - Auth provider
- `src/components/Layout.tsx` - Main layout wrapper
- `src/components/Navbar.tsx` - Navigation
- `src/pages/Homepage.tsx` - Landing page
- `src/pages/Terminal.tsx` - Terminal interface
