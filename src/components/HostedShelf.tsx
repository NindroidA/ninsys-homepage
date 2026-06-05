import { motion } from "framer-motion";
import {
  Blocks,
  Bot,
  Boxes,
  ExternalLink,
  Github,
  Globe,
  LayoutDashboard,
  type LucideIcon,
  Network,
  Server,
  Shield,
} from "lucide-react";
import type { JSX } from "react";
import { type HostedProject, type HostedStatus, hostedProjects } from "../assets/hostedProjects";
import { useSiteConfig } from "../hooks/useSiteConfig";
import { GlassPanel } from "./ui/GlassPanel";

const iconMap: Record<string, LucideIcon> = {
  blocks: Blocks,
  bot: Bot,
  boxes: Boxes,
  server: Server,
  globe: Globe,
  dashboard: LayoutDashboard,
  network: Network,
  shield: Shield,
};

// Locked v2 status palette (mirrors ServiceStatus): live = mint→emerald,
// building reuses the "coming soon" gold→rose.
const statusStyle: Record<HostedStatus, { gradient: string; glow: string; label: string }> = {
  live: {
    gradient: "linear-gradient(135deg,#5eead4,#10b981)",
    glow: "rgba(52,211,153,0.6)",
    label: "live",
  },
  building: {
    gradient: "linear-gradient(135deg,#fcd34d,#fb7185)",
    glow: "rgba(251,113,133,0.5)",
    label: "building",
  },
};

function StatusPill({ status }: { status: HostedStatus }): JSX.Element {
  const s = statusStyle[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/20 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/60">
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${status === "building" ? "motion-safe:animate-pulse" : ""}`}
        style={{ background: s.gradient, boxShadow: `0 0 8px ${s.glow}` }}
      />
      {s.label}
    </span>
  );
}

function HostedCard({ project }: { project: HostedProject }): JSX.Element {
  const Icon = iconMap[project.icon] ?? Server;

  return (
    <GlassPanel className="flex h-full flex-col rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-purple-300/15 bg-gradient-to-br from-violet-500/25 to-pink-500/20">
          <Icon className="h-5 w-5 text-purple-100" />
        </div>
        <StatusPill status={project.status} />
      </div>

      <h3 className="mt-4 font-display text-lg font-bold text-white">{project.name}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-white/55">{project.description}</p>

      {project.stack && project.stack.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {project.stack.map((tag) => (
            <li
              key={tag}
              className="rounded-md border border-white/5 bg-white/[0.03] px-2 py-0.5 font-mono text-[11px] text-white/50"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 flex items-center gap-3 border-t border-white/5 pt-4">
        {project.url ? (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-sm text-purple-200 transition-colors hover:text-white"
          >
            Visit
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : project.status === "building" ? (
          <span className="font-mono text-sm text-white/35">In progress</span>
        ) : null}
        {project.repoUrl && (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-white/50 transition-colors hover:text-white"
            aria-label={`${project.name} on GitHub`}
          >
            <Github className="h-4 w-4" />
          </a>
        )}
      </div>
    </GlassPanel>
  );
}

export default function HostedShelf(): JSX.Element {
  const { config } = useSiteConfig();
  const byId = new Map(hostedProjects.map((p) => [p.id, p]));
  // Render in the admin-configured order, hiding any toggled off.
  const visible = config.hosted
    .filter((h) => h.visible)
    .map((h) => byId.get(h.id))
    .filter((p): p is HostedProject => Boolean(p));

  if (visible.length === 0) return <></>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto w-full max-w-6xl"
    >
      <div className="mb-8">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-white/40">
          {"// running on the homelab"}
        </span>
        <h2 className="mt-1 font-display text-3xl font-bold text-white sm:text-4xl">Hosted</h2>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((project) => (
          <HostedCard key={project.id} project={project} />
        ))}
      </div>
    </motion.div>
  );
}
