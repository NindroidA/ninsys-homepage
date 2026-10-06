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

// A fixed star field (a seeded generator, so it never reshuffles between renders), in a
// 1200×300 sky that the panel crops to its own shape. Stars thin out towards the horizon,
// and three groups twinkle out of step.
const STARS = (() => {
  let seed = 20261005;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  return Array.from({ length: 64 }, (_, i) => ({
    x: Math.round(rand() * 1200),
    y: Math.round(rand() ** 1.7 * 300),
    r: +(0.5 + rand() * 0.9).toFixed(2),
    o: +(0.3 + rand() * 0.55).toFixed(2),
    group: i % 3,
  }));
})();

/**
 * The night sky behind the rack: a deep violet gradient that hides the page's dot texture,
 * a slow aurora along the top, and a sparse star field. Purely decorative, and still under
 * `prefers-reduced-motion`.
 */
function RackSky(): JSX.Element {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden bg-[linear-gradient(180deg,#150c28_0%,#0d0819_48%,#09060f_100%)] will-change-transform"
    >
      <div className="absolute inset-x-0 top-0 h-[72%] mask-[linear-gradient(to_bottom,black_25%,transparent)]">
        <div className="ns-aurora ns-aurora-a absolute -top-1/4 left-[4%] h-[85%] w-[58%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(94,234,212,0.2),transparent)] blur-2xl" />
        <div className="ns-aurora ns-aurora-b absolute -top-1/3 right-[2%] h-full w-[62%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(168,85,247,0.3),transparent)] blur-2xl" />
        <div className="ns-aurora ns-aurora-c absolute top-[6%] left-[16%] h-[28%] w-[68%] -skew-y-6 rounded-[50%] bg-[linear-gradient(90deg,transparent,rgba(94,234,212,0.16),rgba(217,70,239,0.2),transparent)] blur-xl" />
      </div>
      {[0, 1, 2].map((group) => (
        <svg
          key={group}
          className={`ns-stars ns-stars-${group} absolute inset-x-0 top-0 h-[78%] w-full`}
          viewBox="0 0 1200 300"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          {STARS.filter((s) => s.group === group).map((s) => (
            <circle
              key={`${s.x}-${s.y}`}
              cx={s.x}
              cy={s.y}
              r={s.r}
              fill="#efe9ff"
              fillOpacity={s.o}
            />
          ))}
        </svg>
      ))}
    </div>
  );
}

/**
 * The live ops visual for the Status section: the home-lab rack (the isometric layer cube with
 * the brand antenna in a socket on top) on its floor grid, under a night sky. It boots when it
 * scrolls into view and then idles; an offline service turns its status LED rose. A small
 * overlay ties it to the real online/total service count.
 */
export function LiveOpsRack({ online, offline, total }: LiveOpsRackProps): JSX.Element {
  const allOnline = total > 0 && online === total;

  return (
    <GlassPanel className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
      <RackSky />
      <div className="relative flex h-[220px] items-center justify-center sm:h-[380px]">
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
