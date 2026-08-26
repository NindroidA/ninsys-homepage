import { motion } from "framer-motion";
import type { CardProps } from "./types";

export function Card({
  children,
  className = "",
  variant = "default",
  hover = true,
  animate = true,
  delay = 0,
  padding = "lg",
  onClick,
}: CardProps) {
  const baseClasses =
    "relative rounded-2xl border transition-colors duration-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_24px_60px_-32px_rgba(0,0,0,0.85)]";

  // v2 glass: purple-tinted hairline + inner-top highlight, light single blur.
  const variants = {
    default: "bg-white/[0.035] backdrop-blur-md border-purple-300/12",
    glass: "bg-white/3 backdrop-blur-md border-purple-300/10",
    elevated: "bg-white/5 backdrop-blur-md border-purple-300/20",
    minimal: "bg-white/2 backdrop-blur-xs border-white/10",
    gradient:
      "bg-linear-to-br from-violet-500/10 to-pink-500/5 backdrop-blur-md border-purple-400/15",
    bordered: "bg-white/3 backdrop-blur-md border-purple-300/15",
  };

  // Mobile-first: phones get a tighter box, desktop keeps the original scale.
  // These are plain template-string concatenations (no twMerge), so a caller's
  // `className` cannot reliably override a base-breakpoint conflict here.
  const paddings = {
    none: "p-0",
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-6",
    lg: "p-5 sm:p-6 md:p-8",
    xl: "p-6 sm:p-8 md:p-12",
  };

  const hoverClasses = hover ? "hover:border-purple-300/25 hover:bg-white/5.5" : "";

  const classes = `${baseClasses} ${variants[variant]} ${paddings[padding]} ${hoverClasses} ${onClick ? "cursor-pointer" : ""} ${className}`;

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: delay + 0.15 }}
        whileHover={hover ? { scale: 1.01, y: -2 } : {}}
        className={classes}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: click-to-dismiss dialog overlay; Escape is handled by useModalA11y
    // biome-ignore lint/a11y/noStaticElementInteractions: click-to-dismiss dialog overlay; Escape is handled by useModalA11y
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
}
