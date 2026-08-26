import { forwardRef, type HTMLAttributes, type JSX } from "react";
import { cn } from "../../utils/cn";

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Brightens the border + lifts the surface on hover (for clickable cards). */
  interactive?: boolean;
}

/**
 * The v2 glass surface: a purple-tinted hairline border with an inner-top
 * highlight and a soft drop, over a light single-layer blur. Replaces the old
 * heavy stacked `from-white/12 via-gray-800/20 …` gradients used across the site.
 *
 * Sizing, radius and padding are left to the caller via `className`.
 */
export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(function GlassPanel(
  { interactive = false, className = "", children, ...rest },
  ref,
): JSX.Element {
  return (
    <div
      ref={ref}
      className={cn(
        "relative border border-purple-300/12 bg-white/[0.035] backdrop-blur-sm sm:backdrop-blur-md",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07),0_24px_60px_-32px_rgba(0,0,0,0.85)]",
        interactive &&
          "transition-colors duration-300 hover:border-purple-300/25 hover:bg-white/5.5",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});
