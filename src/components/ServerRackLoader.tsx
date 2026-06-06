import { motion, useReducedMotion } from "framer-motion";

interface ServerRackLoaderProps {
  /** When false (or the user prefers reduced motion), render a static silhouette. */
  animated?: boolean;
  /** Optional caption under the rack; omit for the static poster. */
  label?: string;
}

export function ServerRackLoader({
  animated = true,
  label = "Initializing 3D environment...",
}: ServerRackLoaderProps) {
  const reduce = useReducedMotion();
  const isAnimated = animated && !reduce;

  return (
    <div className="w-full h-full flex items-center justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
        {/* Stylized rack silhouette */}
        <div className="w-48 h-72 relative">
          {/* Main frame outline */}
          <div className="absolute inset-0 border-2 border-purple-500/30 rounded-lg bg-linear-to-b from-purple-900/20 to-indigo-900/20 backdrop-blur-xs">
            {/* Server slots with shimmer */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="mx-3 my-2 h-8 rounded bg-linear-to-r from-purple-500/10 via-purple-400/20 to-purple-500/10"
                animate={
                  isAnimated ? { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] } : undefined
                }
                transition={
                  isAnimated ? { duration: 2, repeat: Infinity, delay: i * 0.1 } : undefined
                }
                style={{ backgroundSize: "200% 100%" }}
              />
            ))}
          </div>

          {/* LED indicators */}
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-cyan-400"
                animate={isAnimated ? { opacity: [0.3, 1, 0.3] } : undefined}
                transition={
                  isAnimated ? { duration: 1.5, repeat: Infinity, delay: i * 0.2 } : undefined
                }
              />
            ))}
          </div>

          {/* Orbiting nodes */}
          <motion.div
            className="absolute -inset-8"
            animate={isAnimated ? { rotate: 360 } : undefined}
            transition={isAnimated ? { duration: 20, repeat: Infinity, ease: "linear" } : undefined}
          >
            {[0, 72, 144, 216, 288].map((angle, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full bg-linear-to-r from-cyan-400 to-purple-500"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: `rotate(${angle}deg) translateX(80px) translateY(-50%)`,
                }}
                animate={isAnimated ? { opacity: [0.4, 1, 0.4] } : undefined}
                transition={
                  isAnimated ? { duration: 2, repeat: Infinity, delay: i * 0.3 } : undefined
                }
              />
            ))}
          </motion.div>
        </div>

        {/* Loading caption */}
        {label ? (
          <motion.p
            className="text-center mt-8 text-purple-300/60 text-sm font-mono"
            animate={isAnimated ? { opacity: [0.5, 1, 0.5] } : undefined}
            transition={isAnimated ? { duration: 2, repeat: Infinity } : undefined}
          >
            {label}
          </motion.p>
        ) : null}
      </motion.div>
    </div>
  );
}
