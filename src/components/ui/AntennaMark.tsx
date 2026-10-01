import { useEffect, useId, useState } from "react";

type AntennaAnimation = "boot" | "idle" | false;

interface AntennaMarkProps {
  /** Height of the mark; width follows the 69:74 aspect ratio. Numbers are px. */
  size?: number | string;
  animate?: AntennaAnimation;
  className?: string;
  /** Accessible name. Without it the mark is decorative (it sits next to the wordmark text). */
  title?: string;
}

// The boot sequence plays once per page load. Later mounts (each page renders its own
// Navbar, so every route change remounts it) start straight in idle.
let hasBooted = false;

/**
 * The Nindroid Systems antenna mark (design 10e) as an inline SVG. `animate="boot"` runs
 * the ~2.1s power-on sequence and flows into the idle pulse; `"idle"` runs the pulse only.
 * Keyframes live under `.ns-antenna` in index.css and are skipped for reduced motion,
 * where the resting frame is identical to the static mark.
 */
export function AntennaMark({
  size = "1em",
  animate = false,
  className = "",
  title,
}: AntennaMarkProps) {
  // Gradient ids must be unique per instance, and useId's colons don't survive url(#…).
  const uid = `ns${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [mode] = useState(() => (animate === "boot" && hasBooted ? "idle" : animate));

  useEffect(() => {
    if (mode === "boot") hasBooted = true;
  }, [mode]);

  const height = typeof size === "number" ? `${size}px` : size;
  const a11y = title
    ? { role: "img", "aria-labelledby": `${uid}-title` }
    : { "aria-hidden": true as const };

  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: the title is rendered when one is passed, otherwise the svg is aria-hidden
    <svg
      className={["ns-antenna", mode, className].filter(Boolean).join(" ")}
      viewBox="-34.5 -72.5 69 74"
      overflow="visible"
      style={{ height, width: `calc(${height} * 69 / 74)` }}
      {...a11y}
    >
      {title && <title id={`${uid}-title`}>{title}</title>}
      <defs>
        {/* Only the rim uses this. The rim is rotated -90° so its draw-in starts at 12
            o'clock; the +90° here cancels that, keeping magenta top-left like the static mark. */}
        <linearGradient
          id={`${uid}-brand`}
          x1="0"
          y1="0"
          x2="1"
          y2="1"
          gradientTransform="rotate(90 .5 .5)"
        >
          <stop offset="0" stopColor="#d946ef" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id={`${uid}-sheen`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#cdbdf5" />
        </linearGradient>
        <linearGradient
          id={`${uid}-sig`}
          gradientUnits="userSpaceOnUse"
          x1="-34"
          y1="-72"
          x2="34"
          y2="-28"
        >
          <stop offset="0" stopColor="#6d28d9" />
          <stop offset=".55" stopColor="#a855f7" />
          <stop offset="1" stopColor="#d946ef" />
        </linearGradient>
      </defs>
      <rect
        className="pole"
        x="-5"
        y="-40"
        width="10"
        height="41"
        rx="5"
        fill={`url(#${uid}-sheen)`}
      />
      <g
        className="a1"
        fill="none"
        stroke={`url(#${uid}-sig)`}
        strokeWidth="5.5"
        strokeLinecap="round"
      >
        <path d="M15.7 -63.18A20.5 20.5 0 0 1 15.7 -36.82" />
        <path d="M-15.7 -36.82A20.5 20.5 0 0 1 -15.7 -63.18" />
      </g>
      <g
        className="a2"
        fill="none"
        stroke={`url(#${uid}-sig)`}
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeOpacity=".85"
      >
        <path d="M24.76 -68.66A31 31 0 0 1 24.76 -31.34" />
        <path d="M-24.76 -31.34A31 31 0 0 1 -24.76 -68.66" />
      </g>
      <circle
        className="burst"
        cx="0"
        cy="-50"
        r="13"
        fill="none"
        stroke="#d946ef"
        strokeWidth="2"
      />
      <g className="tip">
        <circle
          cx="0"
          cy="-50"
          r="13"
          fill="#6b5a9e"
          fillOpacity=".5"
          stroke="#cdbdf5"
          strokeWidth="2"
          strokeOpacity=".22"
        />
        <circle
          className="rim"
          cx="0"
          cy="-50"
          r="13"
          fill="none"
          stroke={`url(#${uid}-brand)`}
          strokeWidth="2"
          transform="rotate(-90 0 -50)"
        />
        <circle className="hl" cx="-4.2" cy="-54.2" r="3.2" fill="#ffffff" />
      </g>
    </svg>
  );
}
