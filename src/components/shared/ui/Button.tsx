import { motion } from "framer-motion";
import type { ButtonProps } from "./types";

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  href,
  target,
  type = "button",
  icon,
  iconPosition = "left",
  fullWidth = false,
}: ButtonProps) {
  const baseClasses =
    "rounded-xl font-semibold transition-all duration-200 flex items-center justify-center border";

  const variants = {
    primary:
      "bg-gradient-to-br from-violet-500 to-pink-500 text-white border-transparent shadow-[0_10px_30px_-12px_rgba(236,72,153,0.55)] hover:brightness-110",
    secondary:
      "bg-white/[0.04] hover:bg-white/[0.08] text-white/90 border-purple-300/12 backdrop-blur-md",
    ghost: "bg-transparent hover:bg-white/10 text-white/70 hover:text-white border-transparent",
    gradient:
      "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 text-white border-transparent hover:brightness-110 animate-gradient",
    glass:
      "bg-white/[0.04] hover:bg-white/[0.08] text-purple-100 border-purple-300/15 backdrop-blur-md",
    outline:
      "bg-transparent hover:bg-purple-500/10 text-purple-200 border-purple-400/40 hover:border-purple-400/70",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm gap-2",
    md: "px-6 py-3 text-base gap-2",
    lg: "px-8 py-4 text-lg gap-3",
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`;

  const content = (
    <>
      {icon && iconPosition === "left" && <span className="flex-shrink-0">{icon}</span>}
      {children}
      {icon && iconPosition === "right" && <span className="flex-shrink-0">{icon}</span>}
    </>
  );

  const motionContent = (
    <motion.div
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={classes}
      onClick={disabled ? undefined : onClick}
    >
      {content}
    </motion.div>
  );

  if (href) {
    return (
      <a
        href={href}
        target={target}
        className="inline-block"
        style={{ width: fullWidth ? "100%" : "auto" }}
      >
        {motionContent}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className="inline-block"
      style={{ width: fullWidth ? "100%" : "auto" }}
    >
      {motionContent}
    </button>
  );
}
