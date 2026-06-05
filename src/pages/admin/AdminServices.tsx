import { RefreshCw } from "lucide-react";
import type { JSX } from "react";
import { GlassPanel } from "../../components/ui/GlassPanel";
import { useLiveServices } from "../../hooks/useLiveServices";

const STATUS_META: Record<string, { dot: string; label: string; tint: string }> = {
  online: {
    dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]",
    label: "Online",
    tint: "text-emerald-300",
  },
  offline: {
    dot: "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.5)]",
    label: "Offline",
    tint: "text-rose-300",
  },
  coming_soon: {
    dot: "bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.5)]",
    label: "Coming soon",
    tint: "text-amber-200",
  },
  loading: { dot: "bg-slate-400 animate-pulse", label: "Checking", tint: "text-slate-300" },
};

export function AdminServices(): JSX.Element {
  const { services, loading, error, refresh } = useLiveServices();

  return (
    <div>
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-white/40">
            {"// live infrastructure"}
          </span>
          <h1 className="mt-1 font-display text-3xl font-bold text-white sm:text-4xl">Services</h1>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="rounded-lg border border-purple-300/12 bg-white/[0.04] p-2 text-white/70 transition-colors hover:bg-white/[0.08] disabled:opacity-50"
          aria-label="Refresh services"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </header>

      {error && (
        <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      <GlassPanel className="overflow-hidden rounded-2xl">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 font-mono text-[11px] uppercase tracking-wider text-white/35">
              <th className="px-4 py-3 font-medium">Service</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Category</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Uptime</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => {
              const meta = STATUS_META[s.status] ?? STATUS_META.offline;
              return (
                <tr key={s.id} className="border-b border-white/[0.03] last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{s.name}</div>
                    {s.description && <div className="text-xs text-white/40">{s.description}</div>}
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-xs text-white/50 sm:table-cell">
                    {s.category ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2 font-mono text-xs">
                      <span className={`h-2 w-2 rounded-full ${meta?.dot}`} />
                      <span className={meta?.tint}>{meta?.label}</span>
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-xs text-white/50 md:table-cell">
                    {s.uptime ?? "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </GlassPanel>
    </div>
  );
}
