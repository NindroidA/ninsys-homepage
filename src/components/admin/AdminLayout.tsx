import {
  Activity,
  ExternalLink,
  FolderGit2,
  LayoutDashboard,
  LogOut,
  type LucideIcon,
  Server,
  SlidersHorizontal,
  Wrench,
} from "lucide-react";
import type { JSX } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
  ready: boolean;
}

// Single source of truth for the admin sections. `ready: false` entries render as
// disabled "soon" placeholders so the full structure is visible while it's built.
export const ADMIN_NAV: NavItem[] = [
  {
    label: "Overview",
    to: "/admin",
    icon: LayoutDashboard,
    end: true,
    ready: true,
  },
  { label: "Services", to: "/admin/services", icon: Activity, ready: true },
  {
    label: "Site Config",
    to: "/admin/site",
    icon: SlidersHorizontal,
    ready: true,
  },
  { label: "Hosted", to: "/admin/hosted", icon: Server, ready: false },
  { label: "Projects", to: "/admin/projects", icon: FolderGit2, ready: false },
  { label: "Utilities", to: "/admin/utilities", icon: Wrench, ready: false },
];

function NavRow({ item }: { item: NavItem }): JSX.Element {
  const Icon = item.icon;
  if (!item.ready) {
    return (
      <span className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/25">
        <Icon className="h-4 w-4" />
        <span className="flex-1">{item.label}</span>
        <span className="rounded bg-white/[0.04] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white/30">
          soon
        </span>
      </span>
    );
  }
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
          isActive
            ? "bg-gradient-to-r from-violet-500/20 to-pink-500/15 text-white"
            : "text-white/60 hover:bg-white/[0.05] hover:text-white"
        }`
      }
    >
      <Icon className="h-4 w-4" />
      {item.label}
    </NavLink>
  );
}

export function AdminLayout(): JSX.Element {
  const { logout, user, expiresAt, isGuestViewMode, toggleGuestView } = useAuth();

  return (
    <div className="min-h-screen bg-[#09060f] text-white [background-image:radial-gradient(rgba(198,188,224,0.04)_1px,transparent_1.6px)] [background-size:26px_26px]">
      {/* sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-purple-300/10 bg-black/30 backdrop-blur-md lg:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <span className="font-display text-lg font-bold tracking-tight">
            <span className="bg-gradient-to-b from-white to-[#cdbdf5] bg-clip-text text-transparent">
              N
            </span>
            <span className="bg-gradient-to-br from-[#d946ef] to-[#8b5cf6] bg-clip-text text-transparent">
              S
            </span>
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-white/40">admin</span>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {ADMIN_NAV.map((item) => (
            <NavRow key={item.label} item={item} />
          ))}
        </nav>
        <div className="space-y-1 border-t border-white/5 p-3">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white"
          >
            <ExternalLink className="h-4 w-4" /> View site
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* main */}
      <div className="lg:pl-64">
        {/* topbar */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-purple-300/10 bg-[#09060f]/80 px-4 py-3 backdrop-blur-md sm:px-8">
          {/* mobile brand + nav */}
          <div className="flex min-w-0 items-center gap-3 lg:hidden">
            <span className="font-display text-base font-bold">
              <span className="bg-gradient-to-b from-white to-[#cdbdf5] bg-clip-text text-transparent">
                N
              </span>
              <span className="bg-gradient-to-br from-[#d946ef] to-[#8b5cf6] bg-clip-text text-transparent">
                S
              </span>
            </span>
            <nav className="flex items-center gap-1 overflow-x-auto">
              {ADMIN_NAV.filter((i) => i.ready).map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                      isActive ? "bg-white/10 text-white" : "text-white/55 hover:text-white"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="hidden items-center gap-2 font-mono text-xs text-white/40 lg:flex">
            <span className="h-2 w-2 rounded-full bg-[linear-gradient(135deg,#5eead4,#10b981)] shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            signed in as <span className="text-white/70">{user ?? "admin"}</span>
            {expiresAt && (
              <span className="text-white/30">· expires {formatExpiry(expiresAt)}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleGuestView}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                isGuestViewMode
                  ? "border-amber-500/30 bg-amber-500/15 text-amber-200"
                  : "border-purple-300/12 bg-white/[0.04] text-white/70 hover:bg-white/[0.08]"
              }`}
            >
              {isGuestViewMode ? "Guest view: on" : "Guest view"}
            </button>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-purple-300/12 bg-white/[0.04] p-2 text-white/70 transition-colors hover:bg-rose-500/10 hover:text-rose-300 lg:hidden"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="px-4 py-8 sm:px-8">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function formatExpiry(expiresAt: Date): string {
  const mins = Math.max(0, Math.round((expiresAt.getTime() - Date.now()) / 60000));
  if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  return `${mins}m`;
}
