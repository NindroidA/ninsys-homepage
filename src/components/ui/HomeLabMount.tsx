import { type CSSProperties, useEffect, useId, useRef, useState } from "react";
import { cn } from "../../utils/cn";
import { AntennaGlyph } from "./AntennaMark";

type HomeLabAnimation = "boot" | "idle" | false;

/** What the rack's LEDs report. `degraded` turns the status LED rose and blinks it. */
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

// Everything is drawn in the handoff art's own cube coordinates (mounts/home-lab.svg before
// its 1.11 scale): the top face is the diamond (0,-46) (39.84,-23) (0,0) (-39.84,-23), and
// the base sits on the floor at (0,23). The viewBox frames the rack, the antenna and the glow.
const VIEWBOX = "-60 -62 120 120";

// Shared stroke for the cube faces: the hairline lavender edge from the handoff art.
const EDGE = {
  stroke: "#cdbdf5",
  strokeWidth: ".9",
  strokeOpacity: ".42",
  strokeLinejoin: "round",
} as const;

// ── Floor ──────────────────────────────────────────────────────────────────────
// One grid cell is a quarter of the base diamond, so the rack sits exactly on 2×2 cells.
const BASE = { x: 0, y: 23, halfW: 39.84, halfH: 23 };
const CELL_W = BASE.halfW / 2;
const CELL_H = BASE.halfH / 2;
const FLOOR_SPAN = 12; // lines each side of the centre, per direction

/** The isometric floor lattice as one path: lines at ±30° through the base, CELL_H apart. */
function floorPath(): string {
  const reach = CELL_W * (FLOOR_SPAN + 2);
  const dy = (reach * CELL_H) / CELL_W;
  const parts: string[] = [];
  for (let k = -FLOOR_SPAN; k <= FLOOR_SPAN; k++) {
    const y0 = BASE.y + k * CELL_H;
    parts.push(`M${BASE.x - reach} ${y0 - dy}L${BASE.x + reach} ${y0 + dy}`);
    parts.push(`M${BASE.x - reach} ${y0 + dy}L${BASE.x + reach} ${y0 - dy}`);
  }
  return parts.join("");
}

const FLOOR_D = floorPath();
const BASE_DIAMOND = `M0 0L39.84 23L0 46L-39.84 23Z`;

// ── Antenna mount ──────────────────────────────────────────────────────────────
// A small accent at the back-left of the top face, seated in a socket. `a` runs along the
// front-right edge and `b` along the front-left edge, so (1, 1) is the back corner.
const MOUNT_AT = { a: 0.42, b: 0.9 };
const P = { x: (MOUNT_AT.a - MOUNT_AT.b) * 39.84, y: -(MOUNT_AT.a + MOUNT_AT.b) * 23 };
const ANTENNA_SCALE = 0.34; // antenna units → cube units; about 40% of the handoff mount's size
// The socket is a short cylinder on the top face. Ellipses on the top face are squashed to
// 0.577 (the isometric ratio), so they read as circles lying flat.
const COLLAR = { rx: 4.6, ry: 4.6 * 0.577, height: 2.2 };
const HOLE = { rx: 2.75, ry: 2.75 * 0.577 };
const CAP = { x: P.x, y: P.y - COLLAR.height };
// The pole runs on below the socket's front rim; the clip below hides that part, so it reads
// as set into the rack rather than standing on it.
const POLE_BOTTOM = CAP.y + 4;
const ANTENNA_TRANSFORM = `translate(${P.x} ${POLE_BOTTOM - ANTENNA_SCALE}) scale(${ANTENNA_SCALE})`;
const SOCKET_CLIP = `M-300 -400H300V${CAP.y}H${CAP.x + HOLE.rx}A${HOLE.rx} ${HOLE.ry} 0 0 1 ${CAP.x - HOLE.rx} ${CAP.y}H-300Z`;
const COLLAR_BODY = `M${CAP.x - COLLAR.rx} ${CAP.y}V${P.y}A${COLLAR.rx} ${COLLAR.ry} 0 0 0 ${CAP.x + COLLAR.rx} ${P.y}V${CAP.y}A${COLLAR.rx} ${COLLAR.ry} 0 0 1 ${CAP.x - COLLAR.rx} ${CAP.y}Z`;

// ── Signal routes ──────────────────────────────────────────────────────────────
// Each cycle the antenna pings, then the signal runs from the socket along traces on the top,
// splits, drops down the side faces (the right branch passes straight through the activity
// LED) and leaves through the base as the floor ripple. A pulse is a short dash moved along a
// route (pathLength 100). Every route runs at 90 cube units per second, so its duration is its
// length / 90; the pulses stay together on the shared trunk and split at the junction. Those
// durations are written into the ns-hl-run-* keyframes in index.css (noted per route below).
type Pt = { x: number; y: number };
const top = (a: number, b: number): Pt => ({ x: (a - b) * 39.84, y: -(a + b) * 23 });
function route(points: Pt[]) {
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    const p = points[i] as Pt;
    const q = points[i - 1] as Pt;
    length += Math.hypot(p.x - q.x, p.y - q.y);
  }
  const d = points.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join("");
  // About 9 units of light, whatever the route's length.
  return { d, dash: `${((9 / length) * 100).toFixed(2)} 300` };
}

const TRUNK_START = top(0.42, 0.77); // just in front of the socket
const JUNCTION = top(0.42, 0.5);
const RIGHT_EDGE = top(0.652, 0); // directly above the activity LED (x 25.98)
const LEFT_EDGE = top(0, 0.5);
const ROUTES = {
  // 92.1 units → 1.02s; reaches the activity LED after 69.1 units (0.77s)
  r: route([
    TRUNK_START,
    JUNCTION,
    top(0.652, 0.5),
    RIGHT_EDGE,
    { x: RIGHT_EDGE.x, y: RIGHT_EDGE.y + 46 },
  ]),
  // 77.7 units → 0.86s
  l: route([TRUNK_START, JUNCTION, LEFT_EDGE, { x: LEFT_EDGE.x, y: LEFT_EDGE.y + 46 }]),
  // 14.3 units → 0.16s, ending at a node that flashes
  s: route([TRUNK_START, top(0.42, 0.64), top(0.6, 0.64)]),
};
const NODE = top(0.6, 0.64);

// Boot finale: light streaks along the floor grid, out from the base's three visible corners.
const STREAKS = (() => {
  const corners: Pt[] = [
    { x: 39.84, y: 23 },
    { x: 0, y: 46 },
    { x: -39.84, y: 23 },
  ];
  const dirs = [
    [0, 0.866, -0.5],
    [0, 0.866, 0.5],
    [1, 0.866, 0.5],
    [1, -0.866, 0.5],
    [2, -0.866, 0.5],
    [2, -0.866, -0.5],
  ] as const;
  return dirs.map(([c, dx, dy]) => {
    const from = corners[c] as Pt;
    return `M${from.x} ${from.y}L${(from.x + dx * 64).toFixed(2)} ${(from.y + dy * 64).toFixed(2)}`;
  });
})();

// ── LEDs ───────────────────────────────────────────────────────────────────────
// Three LEDs on the middle layer's front-right face, at the handoff art's positions. The
// matrix lays each one flat on that face (isometric), so they read as lights set into the
// panel rather than stickers on top of it.
const LEDS = [
  { cls: "led-1", x: 32.04, y: 4.5, halo: "#e9d5ff" }, // power: steady
  { cls: "led-2", x: 25.98, y: 8, halo: "#f0abfc" }, // activity: blinks as the signal passes
  { cls: "led-3", x: 19.92, y: 11.5, halo: "#e9d5ff" }, // status: rose when a service is down
] as const;

function Led({
  uid,
  cls,
  x,
  y,
  halo,
}: {
  uid: string;
  cls: string;
  x: number;
  y: number;
  halo: string;
}) {
  return (
    <g transform={`matrix(.866 -.5 0 1 ${x} ${y})`}>
      <circle r="2.5" fill="#1d1233" fillOpacity=".55" />
      <g className={`led ${cls}`}>
        <circle
          className="led-halo"
          r="3.6"
          fill={halo}
          fillOpacity=".7"
          filter={`url(#${uid}-ledblur)`}
        />
        <circle className="led-core" r="1.6" fill="#ffffff" />
        <circle cx="-.55" cy="-.55" r=".55" fill="#ffffff" fillOpacity=".9" />
      </g>
    </g>
  );
}

/**
 * The home-lab rack from the ninsys-branding handoff (`mounts/home-lab.svg`): the isometric
 * layer cube, here with the antenna as a small accent seated in a socket at the back-left of
 * the top. Two stacked SVGs: the floor (grid, ground glow, ripple) stays put while the rack
 * floats above it, so the idle hover is a composited transform with no repaint. The class
 * hooks drive the `.ns-homelab` keyframes in index.css; under `prefers-reduced-motion` it
 * renders the static frame.
 *
 * Boot (about 5.6s): the floor fades up, the layers drop in bottom to top, the LEDs and the
 * top edge light, the socket pops in and the antenna runs AntennaMark's boot. Then a
 * power-on pulse: the antenna flashes, the signal runs down through the rack, the rack hops
 * as its glow blooms and all three LEDs flash, and the base lets out a flare, three
 * shockwaves, a grid flash and streaks of light along the floor. Idle (a 6s cycle): the antenna pings, the signal branches across the top
 * and down the sides (blinking the activity LED on the way), then leaves as a ripple across
 * the floor. Meanwhile the rack hovers over its breathing glow, the power LED holds, the
 * status LED breathes, and a sheen crosses the top now and then.
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
  const ref = useRef<HTMLSpanElement>(null);
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

  const height = typeof size === "number" ? `${size}px` : size;
  const style: CSSProperties | undefined = height ? { height, width: height } : undefined;
  const a11y = title ? { role: "img", "aria-label": title } : { "aria-hidden": true as const };

  return (
    <span
      ref={ref}
      className={cn(
        "ns-homelab relative inline-block",
        mode === "standby" ? "boot standby" : mode,
        animated && mode !== "standby" && !onScreen && "offscreen",
        status === "degraded" && "degraded",
        className,
      )}
      style={style}
      {...a11y}
    >
      <svg
        className="hl-floor absolute inset-0 h-full w-full"
        viewBox={VIEWBOX}
        overflow="visible"
        aria-hidden="true"
      >
        <defs>
          <filter id={`${uid}-soft`} x="-50%" y="-150%" width="200%" height="400%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id={`${uid}-streakblur`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
          <radialGradient id={`${uid}-ambient`}>
            <stop offset="0" stopColor="#8b5cf6" stopOpacity=".2" />
            <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>
          {floor && (
            <>
              {/* Fades the lattice out from the base: an ellipse squashed to the floor's angle. */}
              <radialGradient
                id={`${uid}-fade`}
                gradientUnits="userSpaceOnUse"
                cx={BASE.x}
                cy={BASE.y}
                r="190"
                gradientTransform={`translate(0 ${BASE.y}) scale(1 .34) translate(0 ${-BASE.y})`}
              >
                <stop offset="0" stopColor="#ffffff" />
                <stop offset=".35" stopColor="#ffffff" stopOpacity=".55" />
                <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
              <mask
                id={`${uid}-mask`}
                maskUnits="userSpaceOnUse"
                x="-380"
                y="-60"
                width="760"
                height="220"
              >
                <rect x="-380" y="-60" width="760" height="220" fill={`url(#${uid}-fade)`} />
              </mask>
            </>
          )}
        </defs>

        <ellipse className="ambient" cx="0" cy="8" rx="78" ry="56" fill={`url(#${uid}-ambient)`} />
        {floor && (
          <g className="floor">
            <path
              d={FLOOR_D}
              fill="none"
              stroke="#cdbdf5"
              strokeWidth=".45"
              strokeOpacity=".16"
              mask={`url(#${uid}-mask)`}
            />
            <path
              className="gridflash"
              d={FLOOR_D}
              fill="none"
              stroke="#e9d5ff"
              strokeWidth=".55"
              strokeOpacity=".5"
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
            {[1, 2, 3].map((n) => (
              <path
                key={n}
                className={`boom boom-${n}`}
                d={BASE_DIAMOND}
                fill="none"
                stroke="#f0abfc"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            ))}
            {STREAKS.map((d) => (
              <g key={d} className="streak">
                <path
                  d={d}
                  pathLength={100}
                  strokeDasharray="18 300"
                  fill="none"
                  stroke="#d946ef"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  filter={`url(#${uid}-streakblur)`}
                />
                <path
                  d={d}
                  pathLength={100}
                  strokeDasharray="18 300"
                  fill="none"
                  stroke="#fdf4ff"
                  strokeWidth=".8"
                  strokeLinecap="round"
                />
              </g>
            ))}
          </g>
        )}
        {/* The light pooled under the rack, from the art. It dims a little as the rack rises. */}
        <path
          className="glow"
          d="M0 -2L46.77 25L0 52L-46.77 25Z"
          fill="#c026d3"
          filter={`url(#${uid}-soft)`}
          fillOpacity=".42"
        />
        {/* The boot finale's flash of light out of the base. Hidden at rest. */}
        <path
          className="flare"
          d="M0 -2L46.77 25L0 52L-46.77 25Z"
          fill="#f0abfc"
          filter={`url(#${uid}-soft)`}
          fillOpacity=".75"
        />
      </svg>

      <svg
        className="hl-rack absolute inset-0 h-full w-full"
        viewBox={VIEWBOX}
        overflow="visible"
        aria-hidden="true"
      >
        <defs>
          <filter id={`${uid}-blur`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
          <filter id={`${uid}-ledblur`} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="1.3" />
          </filter>
          <filter id={`${uid}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.4" />
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
          <linearGradient id={`${uid}-collar`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#c9bcef" />
            <stop offset=".5" stopColor="#9d8ad6" />
            <stop offset="1" stopColor="#6c5ba3" />
          </linearGradient>
          <linearGradient id={`${uid}-cap`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#ddd3f8" />
          </linearGradient>
          <radialGradient id={`${uid}-spill`}>
            <stop offset="0" stopColor="#d946ef" stopOpacity=".55" />
            <stop offset="1" stopColor="#d946ef" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-tipglow`}>
            <stop offset="0" stopColor="#d946ef" stopOpacity=".5" />
            <stop offset="1" stopColor="#d946ef" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${uid}-band`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
            <stop offset=".5" stopColor="#ffffff" stopOpacity=".55" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <clipPath id={`${uid}-topface`}>
            <path d="M0 -46L39.84 -23L0 0L-39.84 -23Z" />
          </clipPath>
          <clipPath id={`${uid}-socket`}>
            <path d={SOCKET_CLIP} />
          </clipPath>
        </defs>
        {/* The cube: geometry, paint and draw order as in mounts/home-lab.svg. */}
        <g className="layer layer-b">
          <path d="M0 -14L39.84 9L0 32L-39.84 9Z" fill="#09060f" {...EDGE} />
          <path d="M-39.84 9L0 32L0 46L-39.84 23Z" fill={`url(#${uid}-l)`} {...EDGE} />
          <path d="M39.84 9L0 32L0 46L39.84 23Z" fill={`url(#${uid}-r)`} {...EDGE} />
        </g>
        <g className="layer layer-m">
          <g className="mglow">
            <path d="M-39.84 -7L0 16L0 30L-39.84 7Z" fill="#d946ef" filter={`url(#${uid}-blur)`} />
            <path d="M39.84 -7L0 16L0 30L39.84 7Z" fill="#a855f7" filter={`url(#${uid}-blur)`} />
          </g>
          <path d="M0 -30L39.84 -7L0 16L-39.84 -7Z" fill="#09060f" {...EDGE} />
          <path d="M-39.84 -7L0 16L0 30L-39.84 7Z" fill={`url(#${uid}-ml)`} {...EDGE} />
          <path d="M39.84 -7L0 16L0 30L39.84 7Z" fill={`url(#${uid}-mr)`} {...EDGE} />
          {LEDS.map((led) => (
            <Led key={led.cls} uid={uid} {...led} />
          ))}
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
          {/* A light band that crosses the top now and then. Parked off the face at rest. */}
          <g clipPath={`url(#${uid}-topface)`}>
            <g transform="rotate(-30 0 -23)">
              <rect
                className="sheen"
                x="-7"
                y="-90"
                width="14"
                height="140"
                fill={`url(#${uid}-band)`}
              />
            </g>
          </g>
          {/* The antenna's light on the top, then its socket. */}
          <g clipPath={`url(#${uid}-topface)`}>
            <ellipse
              className="spill"
              cx={P.x}
              cy={P.y}
              rx="13"
              ry="7.5"
              fill={`url(#${uid}-spill)`}
            />
          </g>
          <g className="socket">
            <ellipse
              cx={P.x}
              cy={P.y + 0.4}
              rx={COLLAR.rx + 1.2}
              ry={COLLAR.ry + 0.9}
              fill="#2a1d48"
              fillOpacity=".35"
              filter={`url(#${uid}-shadow)`}
            />
            <path d={COLLAR_BODY} fill={`url(#${uid}-collar)`} {...EDGE} />
            <ellipse
              cx={CAP.x}
              cy={CAP.y}
              rx={COLLAR.rx}
              ry={COLLAR.ry}
              fill={`url(#${uid}-cap)`}
              {...EDGE}
            />
            <ellipse cx={CAP.x} cy={CAP.y} rx={HOLE.rx} ry={HOLE.ry} fill="#3a2d5c" />
          </g>
          <g clipPath={`url(#${uid}-socket)`}>
            <g transform={ANTENNA_TRANSFORM}>
              <g className="ns-antenna">
                <circle className="tipglow" cx="0" cy="-50" r="30" fill={`url(#${uid}-tipglow)`} />
                <AntennaGlyph uid={uid} />
              </g>
            </g>
          </g>
        </g>

        {/* The signal's paths, etched faintly into the rack, and the pulses that run them. */}
        <g className="etch">
          <g fill="none" stroke="#a78bfa" strokeWidth=".6" strokeOpacity=".16">
            {Object.values(ROUTES).map((r) => (
              <path key={r.d} d={r.d} strokeLinejoin="round" />
            ))}
          </g>
          <circle cx={NODE.x} cy={NODE.y} r="1" fill="#a78bfa" fillOpacity=".4" />
          <circle
            className="node"
            cx={NODE.x}
            cy={NODE.y}
            r="1.3"
            fill="#fdf4ff"
            filter={`url(#${uid}-ledblur)`}
          />
        </g>
        {(["r", "l", "s"] as const).map((k) => (
          <g
            key={k}
            className={`run run-${k}`}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d={ROUTES[k].d}
              pathLength={100}
              strokeDasharray={ROUTES[k].dash}
              stroke="#d946ef"
              strokeWidth="2.6"
              filter={`url(#${uid}-ledblur)`}
            />
            <path
              d={ROUTES[k].d}
              pathLength={100}
              strokeDasharray={ROUTES[k].dash}
              stroke="#ffffff"
              strokeWidth=".9"
            />
          </g>
        ))}
      </svg>
    </span>
  );
}
