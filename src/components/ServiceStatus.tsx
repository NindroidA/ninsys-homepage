import { motion } from "framer-motion";
import {
  Activity,
  Cog,
  Cpu,
  Database,
  Globe,
  HardDrive,
  Lightbulb,
  RefreshCw,
  Rocket,
  Server,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { useLiveServices } from "../hooks/useLiveServices";
import { LiveOpsRack } from "./LiveOpsRack";
import { GlassPanel } from "./ui/GlassPanel";

type StatusKey = "online" | "offline" | "maintenance" | "loading" | "coming_soon";

interface StatusStyle {
  /** CSS gradient used for the LED dot + clipped label text. */
  gradient: string;
  /** rgba glow color for the LED dot shadow. */
  glow: string;
  /** Solid text tint used where a gradient clip isn't worth it. */
  tint: string;
  label: string;
  pulse: boolean;
}

// Locked v2 status palette: custom aesthetic gradients, not flat tailwind colors.
const statusStyles: Record<StatusKey, StatusStyle> = {
  online: {
    gradient: "linear-gradient(135deg,#5eead4,#10b981)",
    glow: "rgba(52,211,153,0.65)",
    tint: "text-emerald-300",
    label: "Online",
    pulse: false,
  },
  offline: {
    gradient: "linear-gradient(135deg,#fb7185,#ef4444)",
    glow: "rgba(244,63,94,0.6)",
    tint: "text-rose-300",
    label: "Offline",
    pulse: true,
  },
  maintenance: {
    gradient: "linear-gradient(135deg,#fcd34d,#f59e0b)",
    glow: "rgba(245,158,11,0.6)",
    tint: "text-amber-300",
    label: "Maintenance",
    pulse: true,
  },
  loading: {
    gradient: "linear-gradient(135deg,#cbd5e1,#94a3b8)",
    glow: "rgba(148,163,184,0.5)",
    tint: "text-slate-300",
    label: "Checking",
    pulse: true,
  },
  coming_soon: {
    gradient: "linear-gradient(135deg,#fcd34d,#fb7185)",
    glow: "rgba(251,113,133,0.55)",
    tint: "text-amber-200",
    label: "Coming Soon",
    pulse: false,
  },
};

const iconMap = {
  server: Server,
  database: Database,
  globe: Globe,
  shield: Shield,
  cpu: Cpu,
  storage: HardDrive,
  cog: Cog,
  users: Users,
  lightbulb: Lightbulb,
  activity: Activity,
  zap: Zap,
  rocket: Rocket,
};

const getStatusStyle = (status: string): StatusStyle =>
  statusStyles[status as StatusKey] ?? statusStyles.offline;

const getServiceIcon = (iconName?: string) => {
  if (!iconName) return Server;
  return iconMap[iconName as keyof typeof iconMap] ?? Server;
};

const formatLastChecked = (lastChecked?: string) => {
  if (!lastChecked) return "";
  const diff = Date.now() - new Date(lastChecked).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes >= 60) return `${Math.floor(minutes / 60)}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
};

/** A small status LED with the locked aesthetic gradient + glow. */
function StatusDot({ style, size = "sm" }: { style: StatusStyle; size?: "sm" | "xs" }) {
  const dim = size === "sm" ? "h-2.5 w-2.5" : "h-2 w-2";
  return (
    <span
      aria-hidden="true"
      className={`${dim} shrink-0 rounded-full ${style.pulse ? "motion-safe:animate-pulse" : ""}`}
      style={{ background: style.gradient, boxShadow: `0 0 10px ${style.glow}` }}
    />
  );
}

export default function ServiceStatus() {
  const { services, loading, error, refresh } = useLiveServices();

  const summary = services.reduce<Record<string, number>>((acc, s) => {
    acc[s.status] = (acc[s.status] ?? 0) + 1;
    return acc;
  }, {});
  const online = summary.online ?? 0;

  const summaryPills: { key: StatusKey; count: number }[] = (
    ["online", "offline", "maintenance", "coming_soon"] as StatusKey[]
  )
    .map((key) => ({ key, count: summary[key] ?? 0 }))
    .filter((p) => p.count > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="mx-auto w-full max-w-6xl"
    >
      {/* header */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-white/40">
            {"// live infrastructure"}
          </span>
          <h2 className="mt-1 font-display text-3xl font-bold text-white sm:text-4xl">
            System Status
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-xs">
            {summaryPills.map(({ key, count }) => (
              <span key={key} className="flex items-center gap-1.5">
                <StatusDot style={statusStyles[key]} size="xs" />
                <span className="text-white/80">{count}</span>
                <span className="text-white/40">{statusStyles[key].label.toLowerCase()}</span>
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="rounded-lg border border-purple-300/12 bg-white/[0.04] p-2 text-white/70 transition-colors hover:bg-white/[0.08] disabled:opacity-50"
            title="Refresh all services"
            aria-label="Refresh all services"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      {/* live ops visual */}
      <div className="mb-8">
        <LiveOpsRack online={online} total={services.length} />
      </div>

      {/* service cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {services.map((service, index) => {
          const style = getStatusStyle(service.status);
          const ServiceIcon = getServiceIcon(service.icon);
          const stats = service.stats;
          const hasStats = stats && (stats.guilds || stats.users || stats.devices);

          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.3) }}
            >
              <GlassPanel interactive className="flex h-full flex-col rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl border border-purple-300/12 bg-white/[0.04] p-2.5">
                      <ServiceIcon className="h-5 w-5 text-purple-200" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-base font-semibold leading-tight text-white">
                        {service.name}
                      </h3>
                      {service.category && (
                        <p className="font-mono text-[11px] uppercase tracking-wide text-white/40">
                          {service.category}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 pt-0.5">
                    <StatusDot style={style} />
                    <span className={`font-mono text-xs ${style.tint}`}>{style.label}</span>
                  </div>
                </div>

                {service.description && (
                  <p className="mt-3 text-sm leading-relaxed text-white/55">
                    {service.description}
                  </p>
                )}

                {hasStats && (
                  <dl className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3 font-mono text-xs">
                    {stats.guilds != null && (
                      <div className="flex flex-col">
                        <dt className="text-white/40">servers</dt>
                        <dd className="text-white/80">{stats.guilds}</dd>
                      </div>
                    )}
                    {stats.users != null && (
                      <div className="flex flex-col">
                        <dt className="text-white/40">users</dt>
                        <dd className="text-white/80">{stats.users.toLocaleString()}</dd>
                      </div>
                    )}
                    {stats.devices != null && (
                      <div className="flex flex-col">
                        <dt className="text-white/40">devices</dt>
                        <dd className="text-white/80">{stats.devices}</dd>
                      </div>
                    )}
                  </dl>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 font-mono text-[11px] text-white/40">
                  <span>{service.uptime ? `uptime ${service.uptime}` : " "}</span>
                  {service.lastUpdated && <span>{formatLastChecked(service.lastUpdated)}</span>}
                </div>
              </GlassPanel>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
