import { useEffect, useId, useRef, useState } from "react";
import { AntennaGlyph } from "./AntennaMark";

type HomeLabAnimation = "boot" | "idle" | false;

/** What the rack's LEDs report. `degraded` turns the third LED rose and blinks it. */
export type HomeLabStatus = "ok" | "degraded";

interface HomeLabMountProps {
  /** Height (and width: the mount is square). Numbers are px. Omit to size it with `className`. */
  size?: number | string;
  /**
   * `"boot"` waits until the mount scrolls into view, stacks the rack, boots the antenna, then
   * flows into the idle loop. `"idle"` runs the loop only. `false` renders the static art.
   */
  animate?: HomeLabAnimation;
  status?: HomeLabStatus;
  /** Draw the isometric floor grid, and the signal ripple across it, around the base. */
  floor?: boolean;
  className?: string;
  /** Accessible name. Without it the mount is decorative. */
  title?: string;
}

// Like AntennaMark, the boot plays once per page load; later mounts (coming back to the
// homepage) start straight in idle.
let hasBooted = false;

// Shared stroke for the cube faces: the hairline lavender edge from the handoff art.
const EDGE = {
  stroke: "#cdbdf5",
  strokeWidth: ".9",
  strokeOpacity: ".42",
  strokeLinejoin: "round",
} as const;

// The floor is laid out in the outer 120×120 space. Its centre is the cube's base (the
// bottom face's centre), and one grid cell is a quarter of the base diamond, so the cube
// sits exactly on 2×2 cells.
const BASE = { x: 60, y: 93.02, halfW: 31.84, halfH: 18.38 };
const CELL_W = BASE.halfW;
const CELL_H = BASE.halfH;
const FLOOR_SPAN = 8; // lines each side of the centre, per direction

/** The isometric floor lattice as one path: lines at ±30° through the base, CELL_H apart. */
function floorPath(): string {
  const reach = CELL_W * (FLOOR_SPAN + 2);
  const parts: string[] = [];
  for (let k = -FLOOR_SPAN; k <= FLOOR_SPAN; k++) {
    // Each family is the line through (BASE.x, BASE.y + k·CELL_H) with slope ±CELL_H/CELL_W.
    const y0 = BASE.y + k * CELL_H;
    const dy = (reach * CELL_H) / CELL_W;
    parts.push(`M${BASE.x - reach} ${y0 - dy}L${BASE.x + reach} ${y0 + dy}`);
    parts.push(`M${BASE.x - reach} ${y0 + dy}L${BASE.x + reach} ${y0 - dy}`);
  }
  return parts.join("");
}

const FLOOR_D = floorPath();
const BASE_DIAMOND = `M${BASE.x} ${BASE.y - BASE.halfH}L${BASE.x + BASE.halfW} ${BASE.y}L${BASE.x} ${BASE.y + BASE.halfH}L${BASE.x - BASE.halfW} ${BASE.y}Z`;

/**
 * The "home lab" mount from the ninsys-branding handoff (`mounts/home-lab.svg`): the antenna
 * on the isometric layer cube. The art is used as delivered; the class hooks on its parts
 * drive the `.ns-homelab` keyframes in index.css. Under `prefers-reduced-motion` it renders
 * the static art.
 *
 * Boot (about 3.3s): the floor fades up, the three layers drop in bottom to top, the middle
 * layer's glow and LEDs come on, the top edge draws, then the antenna runs its own boot
 * sequence with AntennaMark's timings. Idle: the antenna pulse, an LED chase, the middle
 * layer breathing, and a signal ripple across the floor every 4.8s.
 */
export function HomeLabMount({
  size,
  animate = false,
  status = "ok",
  floor = false,
  className = "",
  title,
}: HomeLabMountProps) {
  const uid = `hl${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const ref = useRef<SVGSVGElement>(null);
  // "standby" holds the boot at its first frame (parts hidden) until the mount is on screen.
  const [mode, setMode] = useState<"standby" | "boot" | "idle" | false>(() =>
    animate === "boot" ? (hasBooted ? "idle" : "standby") : animate,
  );
  const [onScreen, setOnScreen] = useState(true);
  const animated = mode !== false;

  // One observer does both jobs: it starts the boot once a third of the mount is visible,
  // and pauses every loop while the mount is fully off screen, so it costs nothing there.
  useEffect(() => {
    if (!animated) return;
    const el = ref.current;
    const boot = () => {
      hasBooted = true;
      setMode((m) => (m === "standby" ? "boot" : m));
    };
    if (!el || typeof IntersectionObserver === "undefined") {
      boot();
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setOnScreen(entry.isIntersecting);
        if (entry.intersectionRatio >= 0.35) boot();
      },
      { threshold: [0, 0.35] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [animated]);

  const classes = [
    "ns-homelab",
    mode === "standby" ? "boot standby" : mode,
    animated && mode !== "standby" && !onScreen && "offscreen",
    status === "degraded" && "degraded",
    className,
  ];
  const height = typeof size === "number" ? `${size}px` : size;
  const a11y = title
    ? { role: "img", "aria-labelledby": `${uid}-title` }
    : { "aria-hidden": true as const };

  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: the title is rendered when one is passed, otherwise the svg is aria-hidden
    <svg
      ref={ref}
      className={classes.filter(Boolean).join(" ")}
      viewBox="0 0 120 120"
      overflow="visible"
      style={height ? { height, width: height } : undefined}
      {...a11y}
    >
      {title && <title id={`${uid}-title`}>{title}</title>}
      <defs>
        <filter id={`${uid}-soft`} x="-50%" y="-150%" width="200%" height="400%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id={`${uid}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
        <linearGradient id={`${uid}-l`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a2d5c" />
          <stop offset="1" stopColor="#231a3a" />
        </linearGradient>
        <linearGradient id={`${uid}-r`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#241a3b" />
          <stop offset="1" stopColor="#161027" />
        </linearGradient>
        <linearGradient id={`${uid}-ml`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e879f9" />
          <stop offset="1" stopColor="#c026d3" />
        </linearGradient>
        <linearGradient id={`${uid}-mr`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a855f7" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id={`${uid}-top`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#cdbdf5" />
        </linearGradient>
        <linearGradient id={`${uid}-cl`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9cdf7" />
          <stop offset="1" stopColor="#b3a3e3" />
        </linearGradient>
        <linearGradient id={`${uid}-cr`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8f7fc4" />
          <stop offset="1" stopColor="#6c5ba3" />
        </linearGradient>
        {floor && (
          <>
            {/* Fades the lattice out from the base: an ellipse squashed to the floor's angle. */}
            <radialGradient
              id={`${uid}-fade`}
              gradientUnits="userSpaceOnUse"
              cx={BASE.x}
              cy={BASE.y}
              r="150"
              gradientTransform={`translate(0 ${BASE.y}) scale(1 .34) translate(0 ${-BASE.y})`}
            >
              <stop offset="0" stopColor="#ffffff" />
              <stop offset=".35" stopColor="#ffffff" stopOpacity=".55" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
            <mask
              id={`${uid}-mask`}
              maskUnits="userSpaceOnUse"
              x="-300"
              y="0"
              width="720"
              height="200"
            >
              <rect x="-300" y="0" width="720" height="200" fill={`url(#${uid}-fade)`} />
            </mask>
          </>
        )}
      </defs>

      {floor && (
        <g className="floor">
          <path
            d={FLOOR_D}
            fill="none"
            stroke="#cdbdf5"
            strokeWidth=".35"
            strokeOpacity=".16"
            mask={`url(#${uid}-mask)`}
          />
          <path
            className="ripple"
            d={BASE_DIAMOND}
            fill="none"
            stroke="#d946ef"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </g>
      )}

      {/* The cube: geometry, paint and draw order exactly as in mounts/home-lab.svg. The
          outer transform is that file's nested <svg x="16.8" y="31.44" width="86.4"> box. */}
      <g transform="translate(16.8 31.44) scale(.72)">
        <g transform="translate(60 60) scale(1.11)">
          <path
            className="glow"
            d="M0 -2L46.77 25L0 52L-46.77 25Z"
            fill="#c026d3"
            filter={`url(#${uid}-soft)`}
            fillOpacity=".42"
          />
          <g className="layer layer-b">
            <path d="M0 -14L39.84 9L0 32L-39.84 9Z" fill="#09060f" {...EDGE} />
            <path d="M-39.84 9L0 32L0 46L-39.84 23Z" fill={`url(#${uid}-l)`} {...EDGE} />
            <path d="M39.84 9L0 32L0 46L39.84 23Z" fill={`url(#${uid}-r)`} {...EDGE} />
          </g>
          <g className="layer layer-m">
            <g className="mglow">
              <path
                d="M-39.84 -7L0 16L0 30L-39.84 7Z"
                fill="#d946ef"
                filter={`url(#${uid}-blur)`}
              />
              <path d="M39.84 -7L0 16L0 30L39.84 7Z" fill="#a855f7" filter={`url(#${uid}-blur)`} />
            </g>
            <path d="M0 -30L39.84 -7L0 16L-39.84 -7Z" fill="#09060f" {...EDGE} />
            <path d="M-39.84 -7L0 16L0 30L-39.84 7Z" fill={`url(#${uid}-ml)`} {...EDGE} />
            <path d="M39.84 -7L0 16L0 30L39.84 7Z" fill={`url(#${uid}-mr)`} {...EDGE} />
            <circle className="led led-1" cx="32.04" cy="4.5" r="2.3" fill="#ffffff" />
            <circle
              className="led led-2"
              cx="25.98"
              cy="8"
              r="2.3"
              fill="#ffffff"
              fillOpacity="0.7"
            />
            <circle
              className="led led-3"
              cx="19.92"
              cy="11.5"
              r="2.3"
              fill="#ffffff"
              fillOpacity="0.4"
            />
          </g>
          <g className="layer layer-t">
            <path d="M0 -46L39.84 -23L0 0L-39.84 -23Z" fill={`url(#${uid}-top)`} {...EDGE} />
            <path d="M-39.84 -23L0 0L0 14L-39.84 -9Z" fill={`url(#${uid}-cl)`} {...EDGE} />
            <path d="M39.84 -23L0 0L0 14L39.84 -9Z" fill={`url(#${uid}-cr)`} {...EDGE} />
            <path
              className="edge"
              d="M-39.84 -23L0 0L39.84 -23"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.1"
              strokeOpacity="0.9"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </g>
        </g>
      </g>

      {/* The antenna, placed as in the handoff art (its nested <svg x="36.69" y="8.6"
          width="46.62" height="50"> box). In idle it reuses AntennaMark's loop; its boot
          timings are shifted in index.css so it powers up after the rack lands. */}
      <g
        className={mode === "idle" ? "ns-antenna idle" : "ns-antenna"}
        transform="translate(60 57.586) scale(.675652)"
      >
        <AntennaGlyph uid={uid} />
      </g>
    </svg>
  );
}
