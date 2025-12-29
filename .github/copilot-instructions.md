# Copilot Instructions for NinSys Homepage

## Project Overview

**NinSys Homepage** is a modern personal portfolio site built with React 19 and TypeScript. It features an admin panel for content management, 3D visualizations, an interactive terminal interface, and real-time service monitoring.

**Purpose**: Personal portfolio website for [nindroidsystems.com](https://nindroidsystems.com) with editable projects, about page, and custom interactive features.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 5
- **Package Manager**: Bun (npm-compatible)
- **Styling**: Tailwind CSS 3, Tailwind Merge, Tailwind Animate
- **Animation**: Framer Motion
- **3D Graphics**: Three.js, React Three Fiber, Drei
- **Drag & Drop**: @dnd-kit/core, @dnd-kit/sortable
- **Icons**: Lucide React
- **Routing**: React Router DOM 7
- **Linting**: ESLint 9 with TypeScript ESLint, unused-imports plugin

## Getting Started

### Development Commands

```bash
# Install dependencies
bun install  # or npm install

# Start dev server (http://localhost:3000)
npm run dev

# Build for production
npm run build  # Runs TypeScript compiler then Vite build

# Lint code
npm run lint  # Check for issues
npm run lint:fix  # Auto-fix issues

# Format code
npm run format  # Prettier formatting

# Preview production build
npm run preview
```

### Project Structure

```
src/
├── assets/           # Static data, terminal configs
├── components/       # UI components
│   ├── about/        # About page (SkillVial, SectionCard, etc.)
│   ├── admin/        # Admin UI (login, guest banner)
│   ├── projects/     # Projects page (cards, modals, drag list)
│   └── shared/       # Shared UI (Button, Card, Section)
├── context/          # React context (AuthContext)
├── hooks/            # Custom hooks (useProjects, useGitHubRepos)
├── pages/            # Route pages (Homepage, Projects, Terminal, etc.)
├── types/            # TypeScript interfaces
└── utils/            # API utilities (ninsysAPI.ts)
```

### Routes

- `/` - Homepage with 3D server rack
- `/terminal` - Interactive terminal with TOTP auth
- `/projects` - Portfolio projects (admin editable)
- `/railways` - Interactive minecart game
- `/about` - Personal bio with skill vials (admin editable)

## API Integration

**Backend**: The frontend communicates with a backend API for projects, about page data, GitHub repos, TOTP auth, and service health.

**API Base URL**: Automatically detected based on environment:
- **Development**: `http://localhost:3001` (when hostname is `localhost`)
- **Production**: `https://nindroidsystems.com` (otherwise)

**Authentication**: Uses sessionStorage with key `ninsys_auth_token` for admin operations.

## Coding Conventions

### Components

**Component Style**:
- Use function components with hooks (no class components)
- Define props interfaces above the component
- Pages use default exports; components use named exports

**File Naming**:
- PascalCase for component files (e.g., `ProjectCard.tsx`, `SkillVial.tsx`)
- Match filename to component name

**Example**:
```tsx
interface ProjectCardProps {
  title: string;
  description: string;
}

export default function ProjectCard({ title, description }: ProjectCardProps) {
  return <div>...</div>;
}
```

### Styling

**Tailwind CSS Only**:
- Use Tailwind utility classes exclusively (no CSS modules or styled-components)
- Use Tailwind Merge for conditional classes
- No inline styles unless absolutely necessary

**Design Patterns**:
- **Glassmorphism**: `bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl`
- **Color Scheme**: Purple/indigo gradients (`from-purple-600 to-indigo-600`), slate backgrounds
- **Dark Mode**: Site uses dark theme by default

**Example**:
```tsx
<div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
    Title
  </h2>
</div>
```

### State Management

**Local State**:
- Use `useState` and `useCallback` for component state
- Custom hooks for shared logic (see `src/hooks/`)

**Global State**:
- AuthContext for authentication state
- sessionStorage for auth token (key: `ninsys_auth_token`)
- No Redux, Zustand, or other state libraries

**Example**:
```tsx
const [isOpen, setIsOpen] = useState(false);
const handleToggle = useCallback(() => setIsOpen(prev => !prev), []);
```

### Animation

**Framer Motion**:
- Use for all animations and transitions
- **IMPORTANT**: Use `animate` prop, NOT `whileInView` (causes navigation issues)
- Use `AnimatePresence` for enter/exit animations
- Use `motion.div`, `motion.button`, etc.

**Example**:
```tsx
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      Content
    </motion.div>
  )}
</AnimatePresence>
```

### TypeScript

**Configuration**:
- Strict mode enabled in `tsconfig.json`
- Target: ESNext, Module: Preserve (bundler mode)

**Best Practices**:
- Explicit return types on exported functions
- Prefer `interface` over `type` for object shapes
- Use `const` for immutable values
- Avoid `any` unless necessary (allowed but discouraged by convention; not enforced by ESLint)

**Example**:
```tsx
interface User {
  id: string;
  name: string;
}

export function getUser(id: string): Promise<User> {
  return api.getUser(id);
}
```

### Imports

**Import Order** (convention; unused-imports only removes unused imports/variables):
- React imports first
- External libraries
- Internal components/hooks
- Types
- Utilities

**Example**:
```tsx
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings } from 'lucide-react';
import Button from '../shared/Button';
import type { Project } from '../../types/projects';
import { api } from '../../utils/ninsysAPI';
```

## Architecture Patterns

### Component Architecture

**Pages** (`src/pages/`) contain route-level components that:
- Handle data fetching via custom hooks
- Manage page-level state
- Compose smaller components

**Components** (`src/components/`) are organized by feature:
- `about/` - About page components
- `admin/` - Admin UI components
- `projects/` - Projects page components
- `shared/` - Reusable UI components

### State Flow

```
User Action → Component Handler → Hook Method → API Call → State Update → Re-render
                                                    ↓
                                            Error → Rollback/Display
```

### Modal Pattern

**z-index Hierarchy** (prevent stacking issues):
- GitHub Import Modal: `z-[53]`
- Edit Modal: `z-[52]`
- Delete Confirmation: `z-[51]`
- Backdrop: `z-50`

**Example**:
```tsx
<AnimatePresence>
  {isOpen && (
    <>
      <motion.div 
        className="fixed inset-0 bg-black/60 z-50" 
        onClick={onClose}
      />
      <motion.div className="fixed inset-0 z-[52] flex items-center justify-center p-4">
        <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl max-w-2xl w-full">
          {/* Modal content */}
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>
```

### API Pattern

**NinsysAPI Class** (`src/utils/ninsysAPI.ts`):
- Centralized API client
- Auto-injects auth token from sessionStorage
- Handles request/response formatting

**Example**:
```tsx
import { NinsysAPI } from '../utils/ninsysAPI';

const api = new NinsysAPI();

// Auth token automatically injected
const projects = await api.getProjects();
const created = await api.createProject(projectData);
```

### Drag-and-Drop Pattern

**Using @dnd-kit**:
- `DndContext` wraps sortable area
- `SortableContext` manages sortable items
- `useSortable` hook in each item

**Optimistic Updates with Rollback**:
```tsx
const [items, setItems] = useState(initialItems);
const [previousItems, setPreviousItems] = useState(initialItems);

const handleDragEnd = async (event) => {
  const { active, over } = event;
  if (!over || active.id === over.id) return;
  
  // Store previous state for rollback
  setPreviousItems(items);
  
  // Optimistic update
  const newItems = reorderItems(items, active.id, over.id);
  setItems(newItems);
  
  try {
    await api.updateOrder(newItems);
  } catch (error) {
    // Rollback on failure
    setItems(previousItems);
    console.error('Failed to update order:', error);
  }
};
```

### Custom Hooks Pattern

**Hooks** (`src/hooks/`) encapsulate:
- Data fetching logic
- State management
- Business logic

**Example** (useProjects):
```tsx
export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchProjects = useCallback(async () => {
    const data = await api.getProjects();
    setProjects(data);
  }, []);
  
  const createProject = useCallback(async (input: CreateProjectInput) => {
    const created = await api.createProject(input);
    setProjects(prev => [...prev, created]);
    return created;
  }, []);
  
  return { projects, loading, fetchProjects, createProject };
}
```

## Common Pitfalls & Best Practices

### Animation Issues

**❌ Don't use `whileInView`**:
```tsx
// BAD - causes re-animation on navigation
<motion.div whileInView={{ opacity: 1 }}>
```

**✅ Use `animate` instead**:
```tsx
// GOOD - animates once on mount
<motion.div animate={{ opacity: 1 }}>
```

### Modal Management

**❌ Don't stack modals without z-index**:
```tsx
// BAD - modals will overlap incorrectly
<Modal1 />
<Modal2 />
```

**✅ Use proper z-index hierarchy**:
```tsx
// GOOD - modals stack correctly
<Modal1 className="z-[51]" />
<Modal2 className="z-[52]" />
<Modal3 className="z-[53]" />
```

### Optimistic Updates

**❌ Don't update state without rollback**:
```tsx
// BAD - state stays incorrect on API failure
setItems(newItems);
await api.update(newItems);
```

**✅ Store previous state for rollback**:
```tsx
// GOOD - reverts on failure
setPreviousItems(items);
setItems(newItems);
try {
  await api.update(newItems);
} catch (error) {
  setItems(previousItems);
}
```

### List Keys

**❌ Don't use index as key**:
```tsx
// BAD - breaks on reorder
{items.map((item, index) => <Item key={index} />)}
```

**✅ Use stable unique identifiers**:
```tsx
// GOOD - stable across reorders
{items.map(item => <Item key={item.id} />)}
```

### API Authentication

**❌ Don't manually add auth headers**:
```tsx
// BAD - auth header not consistent
fetch('/api/projects', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**✅ Use NinsysAPI class**:
```tsx
// GOOD - auth token auto-injected
const api = new NinsysAPI();
const projects = await api.getProjects();
```

### String Matching

**❌ Don't use partial string matching**:
```tsx
// BAD - "react" matches "my-react-app"
if (repo.name.includes(searchTerm))
```

**✅ Use exact matching where appropriate**:
```tsx
// GOOD - exact path matching
if (repo.full_name === existingProject.repoPath)
```

## Code Review Checklist

### Code Quality
- [ ] No unused imports or variables (enforced by ESLint)
- [ ] TypeScript types are correct and complete
- [ ] No anti-patterns or code smells
- [ ] Consistent naming conventions (PascalCase components, camelCase variables)
- [ ] Proper error handling in async functions (try/catch blocks)
- [ ] No hardcoded values that should be constants or environment variables

### React/Component Issues
- [ ] No class components (use function components with hooks)
- [ ] Props interfaces defined above components
- [ ] Stable keys for list items (use IDs, not array indices)
- [ ] useEffect cleanup functions present where needed
- [ ] Proper dependency arrays in useEffect/useCallback/useMemo
- [ ] No infinite render loops

### Animation & UI
- [ ] Framer Motion uses `animate` prop, NOT `whileInView`
- [ ] AnimatePresence wraps conditional motion components
- [ ] Modal z-index hierarchy correct (GitHub z-[53] > Edit z-[52] > Delete z-[51])
- [ ] Glassmorphism patterns consistent (`bg-white/5 backdrop-blur-xl border-white/10`)
- [ ] Color scheme follows purple/indigo gradient pattern

### State & Data
- [ ] Optimistic updates have rollback on API failure
- [ ] sessionStorage uses correct key: `ninsys_auth_token`
- [ ] API calls use NinsysAPI class (not raw fetch)
- [ ] Null/undefined checks before accessing nested properties
- [ ] State updates use functional form when depending on previous state

### Security & Performance
- [ ] No sensitive data logged to console
- [ ] Auth token properly handled via sessionStorage
- [ ] No memory leaks from missing cleanup or circular references
- [ ] Images have loading states or fallbacks
- [ ] Large lists use proper keys and avoid unnecessary re-renders

### Testing & Validation
- [ ] Lint passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] Manual testing in dev server: `npm run dev`
- [ ] Check for console errors/warnings in browser
- [ ] Test both admin and guest views if applicable

## Key Files Reference

### Core Application Files
- `src/main.tsx` - Application entry point
- `src/pages/index.tsx` - Root component with routing (`Pages` component)
- `src/context/AuthContext.tsx` - Authentication state provider
- `src/utils/ninsysAPI.ts` - API client wrapper

### Feature Components
- `src/pages/Projects.tsx` - Projects page with admin controls
- `src/pages/AboutMe.tsx` - About page with editable sections
- `src/pages/Terminal.tsx` - Interactive terminal interface
- `src/pages/Homepage.tsx` - Landing page with 3D server rack

### Reusable Components
- `src/components/shared/Button.tsx` - Button component
- `src/components/shared/Card.tsx` - Card component
- `src/components/shared/Section.tsx` - Section wrapper
- `src/components/Layout.tsx` - Page layout wrapper
- `src/components/Navbar.tsx` - Navigation bar

### Custom Hooks
- `src/hooks/useProjects.ts` - Project CRUD operations
- `src/hooks/useGitHubRepos.ts` - GitHub API integration
- `src/hooks/useAuth.ts` - Authentication helpers

### Type Definitions
- `src/types/projects.ts` - Project interfaces
- `src/types/about.ts` - About page interfaces
- `src/types/govee.ts` - Smart device interfaces

## Environment & Deployment

### Development
- Dev server runs on `http://localhost:3000`
- API calls go to `http://localhost:3001` when hostname is localhost
- Uses Vite HMR for fast refresh

### Production
- Built with `npm run build` (outputs to `dist/`)
- API calls go to `https://nindroidsystems.com`
- Served via Docker container with nginx (see `Dockerfile`, `nginx.conf`)

### Configuration Files
- `vite.config.ts` - Vite configuration (React plugin, port 3000)
- `tsconfig.json` - TypeScript configuration (strict mode, ESNext)
- `eslint.config.mjs` - ESLint rules (unused-imports, TypeScript)
- `tailwind.config.js` - Tailwind CSS customization
- `package.json` - Dependencies and scripts

## Additional Resources

- **Changelog**: See `CHANGELOG.md` for version history
- **README**: See `README.md` for feature overview
- **License**: MIT License (see `LICENSE` file)
