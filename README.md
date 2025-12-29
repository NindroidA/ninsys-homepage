# NinSys Homepage

Personal portfolio and homepage for [nindroidsystems.com](https://nindroidsystems.com)

## Features

- **Admin-Editable Projects** - Drag-and-drop ordering with GitHub repository import
- **About Me Page Builder** - Visual editor with skill proficiency vials
- **Interactive Terminal** - Command-line interface with TOTP authentication
- **3D Server Rack** - Three.js visualization on the homepage
- **Live Service Status** - Real-time monitoring of backend services
- **Guest View Mode** - Preview site as visitor without logging out

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 5 |
| Package Manager | Bun |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| 3D Graphics | Three.js + React Three Fiber |
| Drag & Drop | @dnd-kit |
| Icons | Lucide React |
| Routing | React Router DOM 7 |

## Project Structure

```
src/
├── assets/           # Static data and terminal configs
│   └── terminal/     # Terminal feature assets
├── components/       # Reusable UI components
│   ├── about/        # About page components (SkillVial, SectionCard, etc.)
│   ├── admin/        # Admin UI (login, guest banner)
│   ├── projects/     # Projects page components (cards, modals, drag list)
│   └── shared/       # Shared UI components (Button, Card, Section)
├── context/          # React context providers (AuthContext)
├── hooks/            # Custom React hooks
├── pages/            # Route pages
├── types/            # TypeScript interfaces
└── utils/            # API utilities
```

## Routes

| Path | Description |
|------|-------------|
| `/` | Homepage with 3D server rack |
| `/terminal` | Interactive terminal interface |
| `/projects` | Portfolio project showcase |
| `/railways` | Interactive minecart game |
| `/about` | Personal bio and skills |

## API Integration

The frontend communicates with a backend API for:
- Project CRUD operations
- About page data management
- GitHub repository fetching
- TOTP authentication
- Service health monitoring

API URLs are automatically detected based on environment (localhost for dev, production domain for prod).

## Recent Changes

See [CHANGELOG.md](CHANGELOG.md) for version history.

## License

[MIT](LICENSE)
