interface WordmarkProps {
  className?: string;
}

/**
 * The "Nindroid Systems" wordmark (design option A): "Nindroid" in a white→lavender
 * sheen with a soft glow, "Systems" in the magenta→violet brand gradient. Size is
 * controlled by the parent's font-size, so pass sizing via `className`.
 */
export function Wordmark({ className = "" }: WordmarkProps) {
  return (
    <span className={`font-display font-bold tracking-tight ${className}`}>
      <span className="bg-gradient-to-b from-white to-[#cdbdf5] bg-clip-text text-transparent [filter:drop-shadow(0_2px_22px_rgba(167,139,250,0.4))]">
        Nindroid
      </span>{" "}
      <span className="bg-gradient-to-br from-[#d946ef] to-[#8b5cf6] bg-clip-text text-transparent">
        Systems
      </span>
    </span>
  );
}
