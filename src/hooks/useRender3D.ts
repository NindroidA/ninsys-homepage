import { useEffect, useState } from "react";

/**
 * Decide whether to mount the WebGL 3D scene on the homepage.
 *
 * Returns `false` — and the three.js chunk is never fetched — for visitors where
 * WebGL is a poor trade: users who prefer reduced motion, small/mobile viewports,
 * and low-end devices (very few CPU cores or little memory). Those visitors get a
 * lightweight static poster instead, which is the single biggest mobile win here.
 *
 * Starts `false` so the heavy scene is opt-in only after a client-side capability
 * check (also keeps it safe for any future SSG/prerender pass).
 */
export function useRender3D(): boolean {
  const [render3D, setRender3D] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isSmallViewport = window.matchMedia("(max-width: 768px)").matches;
    const cores = navigator.hardwareConcurrency ?? 8;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    const isLowEnd = cores <= 2 || memory <= 2;

    setRender3D(!prefersReducedMotion && !isSmallViewport && !isLowEnd);
  }, []);

  return render3D;
}
