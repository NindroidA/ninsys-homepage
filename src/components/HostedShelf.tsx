import { motion } from "framer-motion";
import {
  Blocks,
  Bot,
  Boxes,
  ExternalLink,
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
import { GithubIcon } from "./icons/BrandIcons";
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
    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white/60 sm:gap-1.5 sm:px-2.5 sm:py-1 sm:tracking-[0.16em]">
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
    <GlassPanel className="flex h-full flex-col rounded-xl p-3.5 sm:rounded-2xl sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-purple-300/15 bg-linear-to-br from-violet-500/25 to-pink-500/20 sm:h-11 sm:w-11 sm:rounded-xl">
          <Icon className="h-4 w-4 text-purple-100 sm:h-5 sm:w-5" />
        </div>
        <StatusPill status={project.status} />
      </div>

      <h3 className="mt-3 font-display text-base font-bold text-white sm:mt-4 sm:text-lg">
        {project.name}
      </h3>
      <p className="mt-1 flex-1 text-[13px] leading-snug text-white/55 line-clamp-2 sm:mt-1.5 sm:text-sm sm:leading-relaxed sm:line-clamp-none">
        {project.description}
      </p>

      {project.stack && project.stack.length > 0 && (
        <ul className="mt-2.5 hidden flex-wrap gap-1.5 sm:mt-4 sm:flex">
          {project.stack.map((tag) => (
            <li
              key={tag}
              className="rounded-md border border-white/5 bg-white/3 px-2 py-0.5 font-mono text-[11px] text-white/50"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex items-center gap-3 border-t border-white/5 pt-3 sm:mt-5 sm:pt-4">
        {project.url ? (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-[13px] text-purple-200 transition-colors hover:text-white sm:text-sm"
          >
            Visit
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : project.status === "building" ? (
          <span className="font-mono text-[13px] text-white/35 sm:text-sm">In progress</span>
        ) : null}
        {project.repoUrl && (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-white/50 transition-colors hover:text-white"
            aria-label={`${project.name} on GitHub`}
          >
            <GithubIcon className="h-4 w-4" />
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
        <h2 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl md:text-4xl">
          Hosted
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {visible.map((project) => (
          <HostedCard key={project.id} project={project} />
        ))}
      </div>
    </motion.div>
  );
}
