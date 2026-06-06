import type { BadgeProps } from "./types";

export function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
  icon,
  pulse = false,
}: BadgeProps) {
  const variants = {
    default: "bg-white/6 text-white/80 border-white/10 hover:bg-white/10",
    success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/25",
    warning: "bg-amber-500/15 text-amber-300 border-amber-500/25 hover:bg-amber-500/25",
    error: "bg-rose-500/15 text-rose-300 border-rose-500/25 hover:bg-rose-500/25",
    info: "bg-sky-500/15 text-sky-300 border-sky-500/25 hover:bg-sky-500/25",
    purple: "bg-violet-500/15 text-violet-200 border-violet-400/25 hover:bg-violet-500/25",
    pink: "bg-pink-500/15 text-pink-200 border-pink-400/25 hover:bg-pink-500/25",
    cyan: "bg-cyan-500/15 text-cyan-200 border-cyan-400/25 hover:bg-cyan-500/25",
  };

  const sizes = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-3 py-1.5 text-sm gap-1.5",
    lg: "px-4 py-2 text-base gap-2",
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg border font-medium transition-colors duration-200 ${variants[variant]} ${sizes[size]} ${pulse ? "animate-pulse" : ""} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
