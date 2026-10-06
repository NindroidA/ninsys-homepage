import { ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import type { JSX } from "react";
import { Link } from "react-router-dom";
import { SaveStatus } from "../../components/admin/SaveStatus";
import { GlassPanel } from "../../components/ui/GlassPanel";
import { useSiteConfig } from "../../hooks/useSiteConfig";

export function AdminHosted(): JSX.Element {
  const { config, toggleHosted, moveHosted } = useSiteConfig();
  const visibleCount = config.hosted.filter((h) => h.visible).length;

  return (
    <div>
      <header className="mb-8">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-white/40">
          {"// running on the homelab"}
        </span>
        <h1 className="mt-1 font-display text-3xl font-bold text-white sm:text-4xl">Hosted</h1>
      </header>

      <SaveStatus />

      <GlassPanel className="rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-white">
            Shelf cards{" "}
            <span className="font-mono text-xs font-normal text-white/35">
              {visibleCount}/{config.hosted.length} shown
            </span>
          </h2>
          <Link
            to="/"
            className="font-mono text-xs text-purple-200 transition-colors hover:text-white"
          >
            view homepage →
          </Link>
        </div>

        <ul className="space-y-2">
          {config.hosted.map((project, index) => {
            const isLive = project.status === "live";
            return (
              <li
                key={project.id}
                className={`flex items-center gap-3 rounded-xl border border-white/5 px-3 py-2.5 transition-opacity ${
                  project.visible ? "bg-white/3" : "bg-white/1 opacity-50"
                }`}
              >
                <span className="font-mono text-[11px] text-white/30">{index + 1}</span>
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    isLive
                      ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                      : "bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                  }`}
                  title={project.status}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-white/85">{project.name}</div>
                  <div className="font-mono text-[11px] text-white/35">{project.status}</div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveHosted(project.id, -1)}
                    disabled={index === 0}
                    className="rounded p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                    aria-label={`Move ${project.name} up`}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveHosted(project.id, 1)}
                    disabled={index === config.hosted.length - 1}
                    className="rounded p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                    aria-label={`Move ${project.name} down`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => toggleHosted(project.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-purple-300/12 bg-white/4 px-2.5 py-1.5 font-mono text-[11px] text-white/70 transition-colors hover:bg-white/8"
                  aria-label={`${project.visible ? "Hide" : "Show"} ${project.name}`}
                >
                  {project.visible ? (
                    <>
                      <Eye className="h-3.5 w-3.5" /> shown
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3.5 w-3.5" /> hidden
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </GlassPanel>
    </div>
  );
}
