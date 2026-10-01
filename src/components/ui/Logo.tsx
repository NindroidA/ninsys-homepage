import { AntennaMark } from "./AntennaMark";
import { Wordmark } from "./Wordmark";

interface LogoProps {
  variant?: "horizontal" | "compact";
  animate?: "boot" | "idle" | false;
  className?: string;
}

/**
 * Antenna mark + wordmark lockups. Like `Wordmark`, everything is sized by the parent's
 * font-size. Horizontal is the primary lockup (site header, docs); compact ("NinSys") is
 * for tight spaces. Clear space (1x = 0.351 × mark height) is left to the layout.
 */
export function Logo({ variant = "horizontal", animate = false, className = "" }: LogoProps) {
  if (variant === "compact") {
    return (
      <span className={`inline-flex items-center gap-[0.35em] ${className}`}>
        <AntennaMark size="1.3em" animate={animate} />
        <span className="font-display font-bold leading-none tracking-tight">
          <span className="bg-linear-to-b from-white to-[#cdbdf5] bg-clip-text text-transparent filter-[drop-shadow(0_0.05em_0.5em_rgba(167,139,250,0.4))]">
            Nin
          </span>
          <span className="bg-linear-to-br from-[#d946ef] to-[#8b5cf6] bg-clip-text text-transparent">
            Sys
          </span>
        </span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-[0.43em] ${className}`}>
      <AntennaMark size="1.64em" animate={animate} />
      <Wordmark />
    </span>
  );
}
