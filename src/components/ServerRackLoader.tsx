import { motion } from 'framer-motion';

export function ServerRackLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative"
      >
        {/* Stylized loading rack silhouette */}
        <div className="w-48 h-72 relative">
          {/* Main frame outline */}
          <div className="absolute inset-0 border-2 border-purple-500/30 rounded-lg bg-gradient-to-b from-purple-900/20 to-indigo-900/20 backdrop-blur-sm">
            {/* Server slots with shimmer */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="mx-3 my-2 h-8 rounded bg-gradient-to-r from-purple-500/10 via-purple-400/20 to-purple-500/10"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
                style={{
                  backgroundSize: '200% 100%',
                }}
              />
            ))}
          </div>

          {/* LED indicators */}
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-cyan-400"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>

          {/* Orbiting nodes */}
          <motion.div
            className="absolute -inset-8"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            {[0, 72, 144, 216, 288].map((angle, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${angle}deg) translateX(80px) translateY(-50%)`,
                }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </motion.div>
        </div>

        {/* Loading text */}
        <motion.p
          className="text-center mt-8 text-purple-300/60 text-sm font-mono"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Initializing 3D environment...
        </motion.p>
      </motion.div>
    </div>
  );
}
