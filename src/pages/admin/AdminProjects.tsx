import { ExternalLink, Loader2, Star } from "lucide-react";
import type { JSX } from "react";
import { Link } from "react-router-dom";
import { GlassPanel } from "../../components/ui/GlassPanel";
import { useProjects } from "../../hooks/useProjects";

function Stat({ value, label }: { value: number; label: string }): JSX.Element {
  return (
    <GlassPanel className="rounded-2xl p-5">
      <div className="font-display text-3xl font-bold text-white">{value}</div>
      <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-white/40">
        {label}
      </div>
    </GlassPanel>
  );
}

export function AdminProjects(): JSX.Element {
  const { projects, loading, error } = useProjects();

  const current = projects.filter((p) => p.category === "current").length;
  const completed = projects.filter((p) => p.category === "completed").length;
  const featured = projects.filter((p) => p.featured).length;

  return (
    <div>
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-white/40">
            {"// portfolio"}
          </span>
          <h1 className="mt-1 font-display text-3xl font-bold text-white sm:text-4xl">Projects</h1>
        </div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Open editor <ExternalLink className="h-4 w-4" />
        </Link>
      </header>

      <div className="mb-6 rounded-xl border border-purple-300/12 bg-white/[0.03] px-4 py-3 font-mono text-xs text-white/55">
        Full create / edit / reorder / GitHub-import lives on the{" "}
        <Link to="/projects" className="text-purple-200 hover:text-white">
          Projects page
        </Link>{" "}
        editor (admin mode). This is the at-a-glance view.
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat value={projects.length} label="Total" />
        <Stat value={featured} label="Featured" />
        <Stat value={current} label="Current" />
        <Stat value={completed} label="Completed" />
      </div>

      <GlassPanel className="rounded-2xl p-5">
        <h2 className="mb-4 font-display text-lg font-semibold text-white">All projects</h2>
        {loading ? (
          <div className="flex items-center gap-2 py-6 text-white/50">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : error ? (
          <p className="py-2 text-sm text-rose-300">{error}</p>
        ) : projects.length === 0 ? (
          <p className="py-2 text-sm text-white/45">No projects yet.</p>
        ) : (
          <ul className="space-y-2">
            {projects.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
              >
                {p.featured && <Star className="h-3.5 w-3.5 fill-current text-amber-300" />}
                <span className="truncate text-sm text-white/85">{p.title}</span>
                <span className="ml-auto font-mono text-[11px] capitalize text-white/35">
                  {p.category}
                </span>
              </li>
            ))}
          </ul>
        )}
      </GlassPanel>
    </div>
  );
}
