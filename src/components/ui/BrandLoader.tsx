import { cn } from "../../utils/cn";
import { AntennaMark } from "./AntennaMark";

interface BrandLoaderProps {
  /** Caption under the mark, in the hero tagline's terminal voice. */
  label?: string;
  /** Fill the viewport (route-level fallbacks) instead of sitting inside a section. */
  fullscreen?: boolean;
  className?: string;
}

/**
 * The branded loading state: the antenna mark in its idle pulse over a soft violet glow,
 * with a `// loading` caption and a blinking cursor. Screen readers get a plain "Loading"
 * status; the caption is decorative. Under reduced motion the mark and cursor hold still.
 */
export function BrandLoader({
  label = "loading",
  fullscreen = false,
  className = "",
}: BrandLoaderProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center gap-5",
        fullscreen ? "min-h-screen" : "py-14",
        className,
      )}
    >
      <span className="relative inline-flex">
        <span
          aria-hidden="true"
          className="absolute inset-[-60%] rounded-full bg-[radial-gradient(closest-side,rgba(139,92,246,0.22),transparent)]"
        />
        <AntennaMark size={fullscreen ? 64 : 52} animate="idle" className="relative" />
      </span>
      <span className="sr-only">Loading</span>
      <span
        aria-hidden="true"
        className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#cdbdf5]/60"
      >
        {`// ${label}`}
        <span className="inline-block h-3 w-1.5 translate-y-px bg-[#d946ef]/80 motion-safe:animate-[blink_1.1s_steps(1)_infinite]" />
      </span>
    </div>
  );
}
