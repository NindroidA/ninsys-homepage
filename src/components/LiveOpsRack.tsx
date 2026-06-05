import { type JSX, lazy, Suspense, useState } from "react";
import { useRender3D } from "../hooks/useRender3D";
import { useSiteConfig } from "../hooks/useSiteConfig";
import { ServerRackLoader } from "./ServerRackLoader";
import { GlassPanel } from "./ui/GlassPanel";

const ServerRackScene = lazy(() => import("./ServerRackScene"));

interface LiveOpsRackProps {
  /** Services currently reporting online. */
  online: number;
  /** Total services in the registry. */
  total: number;
}

/**
 * The live ops visual for the Status section — the WebGL server rack relocated
 * out of the old hero. The heavy three.js chunk is lazy-loaded and only fetched
 * on capable devices (see `useRender3D`); everyone else gets the lightweight 2D
 * rack poster. A small overlay ties it to the real online/total service count.
 */
export function LiveOpsRack({ online, total }: LiveOpsRackProps): JSX.Element {
  const { config } = useSiteConfig();
  const render3D = useRender3D() && config.enable3DRack;
  const [failed, setFailed] = useState(false);
  const allOnline = total > 0 && online === total;

  return (
    <GlassPanel className="relative overflow-hidden rounded-3xl">
      <div className="h-[300px] sm:h-[380px]">
        {render3D && !failed ? (
          <Suspense fallback={<ServerRackLoader />}>
            <ServerRackScene onError={() => setFailed(true)} />
          </Suspense>
        ) : (
          <ServerRackLoader label="" />
        )}
      </div>

      {/* live overlay */}
      <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full border border-purple-300/12 bg-black/30 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] backdrop-blur-md">
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
