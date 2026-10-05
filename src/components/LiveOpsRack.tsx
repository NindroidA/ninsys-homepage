import type { JSX } from "react";
import { GlassPanel } from "./ui/GlassPanel";
import { HomeLabMount } from "./ui/HomeLabMount";

interface LiveOpsRackProps {
  /** Services currently reporting online. */
  online: number;
  /** Services currently reporting offline. */
  offline: number;
  /** Total services in the registry. */
  total: number;
}

/**
 * The live ops visual for the Status section: the home-lab mount (the antenna on the
 * isometric rack) on its floor grid. It boots when it scrolls into view and then idles; an
 * offline service turns one of its LEDs rose. A small overlay ties it to the real
 * online/total service count.
 */
export function LiveOpsRack({ online, offline, total }: LiveOpsRackProps): JSX.Element {
  const allOnline = total > 0 && online === total;

  return (
    <GlassPanel className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
      <div className="flex h-[220px] items-center justify-center sm:h-[380px]">
        <HomeLabMount
          animate="boot"
          floor
          status={offline > 0 ? "degraded" : "ok"}
          className="h-[188px] w-[188px] sm:h-[330px] sm:w-[330px]"
        />
      </div>

      {/* live overlay */}
      <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-full border border-purple-300/12 bg-black/30 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] backdrop-blur-md sm:left-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-[11px]">
        <span
          className="h-2 w-2 rounded-full bg-[linear-gradient(135deg,#5eead4,#10b981)] shadow-[0_0_10px_rgba(52,211,153,0.7)] motion-safe:animate-pulse"
          aria-hidden="true"
        />
        <span className="text-white/70">live</span>
      </div>
      <div className="pointer-events-none absolute bottom-4 right-4 font-mono text-[11px] uppercase tracking-[0.16em] text-white/40">
        <span className={allOnline ? "text-emerald-300/80" : "text-white/60"}>{online}</span>/
        {total} online
      </div>
    </GlassPanel>
  );
}
