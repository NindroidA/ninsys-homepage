import { Activity, FolderGit2, Server, Star, UserSquare } from "lucide-react";
import type { JSX } from "react";
import { Link } from "react-router-dom";
import { hostedProjects } from "../../assets/hostedProjects";
import { GlassPanel } from "../../components/ui/GlassPanel";
import { useAboutData } from "../../hooks/useAboutData";
import { useLiveServices } from "../../hooks/useLiveServices";
import { useProjects } from "../../hooks/useProjects";

function StatCard({
  icon: Icon,
  value,
  label,
  hint,
}: {
  icon: typeof Activity;
  value: string | number;
  label: string;
  hint?: string;
}): JSX.Element {
  return (
    <GlassPanel className="rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/40">
          {label}
        </span>
        <Icon className="h-4 w-4 text-purple-200" />
      </div>
      <div className="mt-3 font-display text-3xl font-bold text-white">{value}</div>
      {hint && <div className="mt-1 font-mono text-[11px] text-white/35">{hint}</div>}
    </GlassPanel>
  );
}

export function AdminOverview(): JSX.Element {
  const { services } = useLiveServices();
  const { projects } = useProjects();
  const { data: about } = useAboutData();

  const online = services.filter((s) => s.status === "online").length;
  const featured = projects.filter((p) => p.featured).length;
  const hostedLive = hostedProjects.filter((p) => p.status === "live").length;
  const hostedBuilding = hostedProjects.filter((p) => p.status === "building").length;

  return (
    <div>
      <header className="mb-8">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-white/40">
          {"// control room"}
        </span>
        <h1 className="mt-1 font-display text-3xl font-bold text-white sm:text-4xl">Overview</h1>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Activity}
          value={`${online}/${services.length}`}
          label="Services"
          hint="online / total"
        />
        <StatCard
          icon={FolderGit2}
          value={projects.length}
          label="Projects"
          hint={`${featured} featured`}
        />
        <StatCard
          icon={Server}
          value={hostedProjects.length}
          label="Hosted"
          hint={`${hostedLive} live · ${hostedBuilding} building`}
        />
        <StatCard
          icon={UserSquare}
          value={about.sections.length}
          label="About sections"
          hint={about.profile.name || "—"}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* live services mini-list */}
        <GlassPanel className="rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-white">Live services</h2>
            <Link
              to="/admin/services"
              className="font-mono text-xs text-purple-200 transition-colors hover:text-white"
            >
              details →
            </Link>
          </div>
          <ul className="space-y-2">
            {services.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
              >
                <span className="truncate text-sm text-white/80">{s.name}</span>
                <span className="flex items-center gap-2 font-mono text-[11px] text-white/40">
                  {s.uptime && <span>{s.uptime}</span>}
                  <span className={`h-2 w-2 rounded-full ${dotClass(s.status)}`} title={s.status} />
                </span>
              </li>
            ))}
          </ul>
        </GlassPanel>

        {/* featured projects */}
        <GlassPanel className="rounded-2xl p-5">
          <h2 className="mb-4 font-display text-lg font-semibold text-white">Featured projects</h2>
          {featured === 0 ? (
            <p className="text-sm text-white/45">No featured projects.</p>
          ) : (
            <ul className="space-y-2">
              {projects
                .filter((p) => p.featured)
                .map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-sm text-white/80"
                  >
                    <Star className="h-3.5 w-3.5 fill-current text-amber-300" />
                    <span className="truncate">{p.title}</span>
                    <span className="ml-auto font-mono text-[11px] capitalize text-white/35">
                      {p.category}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}

function dotClass(status: string): string {
  switch (status) {
    case "online":
      return "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]";
    case "offline":
      return "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.5)]";
    case "coming_soon":
      return "bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.5)]";
    default:
      return "bg-slate-400";
  }
}
