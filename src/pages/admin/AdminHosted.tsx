import { ChevronDown, ChevronUp, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { type JSX, useState } from "react";
import { Link } from "react-router-dom";
import { HostedEntryModal } from "../../components/admin/HostedEntryModal";
import { SaveStatus } from "../../components/admin/SaveStatus";
import { GlassPanel } from "../../components/ui/GlassPanel";
import { useSiteConfig } from "../../hooks/useSiteConfig";
import { HOSTED_LIMITS } from "../../lib/siteConfig";
import type { HostedEntry } from "../../types/siteConfig";

const iconButton =
  "rounded p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-25";

export function AdminHosted(): JSX.Element {
  const { config, toggleHosted, moveHosted, saveHosted, removeHosted } = useSiteConfig();
  // null: closed. { entry: undefined }: adding. { entry }: editing that entry.
  const [editing, setEditing] = useState<{ entry?: HostedEntry } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const visibleCount = config.hosted.filter((h) => h.visible).length;
  const full = config.hosted.length >= HOSTED_LIMITS.entries;

  const askDelete = (id: string) => {
    if (confirmDelete === id) {
      setConfirmDelete(null);
      removeHosted(id).catch(() => undefined); // a failure shows in SaveStatus
      return;
    }
    setConfirmDelete(id);
    setTimeout(() => setConfirmDelete((current) => (current === id ? null : current)), 4000);
  };

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
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-white">
            Shelf cards{" "}
            <span className="font-mono text-xs font-normal text-white/35">
              {visibleCount}/{config.hosted.length} shown
            </span>
          </h2>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="font-mono text-xs text-purple-200 transition-colors hover:text-white"
            >
              view homepage →
            </Link>
            <button
              type="button"
              onClick={() => setEditing({})}
              disabled={full}
              title={full ? `The shelf holds up to ${HOSTED_LIMITS.entries} entries` : undefined}
              className="inline-flex items-center gap-1.5 rounded-lg bg-linear-to-br from-violet-500 to-pink-500 px-3 py-2 text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" /> Add entry
            </button>
          </div>
        </div>

        {config.hosted.length === 0 ? (
          <p className="rounded-xl border border-white/5 bg-white/2 px-4 py-6 text-center text-sm text-white/45">
            No entries. The Hosted section stays off the homepage until you add one.
          </p>
        ) : (
          <ul className="space-y-2">
            {config.hosted.map((project, index) => {
              const isLive = project.status === "live";
              const deleting = confirmDelete === project.id;
              return (
                <li
                  key={project.id}
                  className={`flex items-center gap-2 rounded-xl border border-white/5 px-3 py-2.5 transition-opacity sm:gap-3 ${
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
                    <div className="truncate font-mono text-[11px] text-white/35">
                      {project.status}
                      {project.url ? ` · ${project.url.replace(/^https?:\/\//, "")}` : ""}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => moveHosted(project.id, -1)}
                      disabled={index === 0}
                      className={iconButton}
                      aria-label={`Move ${project.name} up`}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveHosted(project.id, 1)}
                      disabled={index === config.hosted.length - 1}
                      className={iconButton}
                      aria-label={`Move ${project.name} down`}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleHosted(project.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-purple-300/12 bg-white/4 px-2 py-1.5 font-mono text-[11px] text-white/70 transition-colors hover:bg-white/8 sm:px-2.5"
                    aria-label={`${project.visible ? "Hide" : "Show"} ${project.name}`}
                  >
                    {project.visible ? (
                      <>
                        <Eye className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">shown</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">hidden</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditing({ entry: project })}
                    className={iconButton}
                    aria-label={`Edit ${project.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => askDelete(project.id)}
                    className={
                      deleting
                        ? "inline-flex items-center gap-1 rounded-lg border border-rose-400/40 bg-rose-500/15 px-2 py-1.5 font-mono text-[11px] text-rose-100 transition-colors hover:bg-rose-500/25"
                        : iconButton
                    }
                    aria-label={
                      deleting ? `Confirm: delete ${project.name}` : `Delete ${project.name}`
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                    {deleting && <span>delete?</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </GlassPanel>

      <HostedEntryModal
        isOpen={editing !== null}
        entry={editing?.entry}
        takenIds={config.hosted.map((h) => h.id)}
        onClose={() => setEditing(null)}
        onSave={saveHosted}
      />
    </div>
  );
}
