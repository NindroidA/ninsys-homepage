import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { SKILL_LEVEL_LABELS, SKILL_LEVEL_PERCENT, SkillLevel } from '../../types/about';

interface SkillVialProps {
  name: string;
  level: SkillLevel;
  category?: string;
  compact?: boolean;
}

// Diagonal gradient colors based on level (from bottom-left to top-right of liquid)
const LEVEL_GRADIENTS: Record<SkillLevel, { from: string; to: string; mid: string; glow: string }> = {
  novice: { from: '#991b1b', to: '#f87171', mid: '#dc2626', glow: 'rgba(239, 68, 68, 0.6)' },        // red gradient
  beginner: { from: '#9a3412', to: '#fdba74', mid: '#ea580c', glow: 'rgba(249, 115, 22, 0.6)' },     // orange gradient
  intermediate: { from: '#854d0e', to: '#fde047', mid: '#eab308', glow: 'rgba(234, 179, 8, 0.6)' },  // yellow gradient
  advanced: { from: '#3f6212', to: '#bef264', mid: '#84cc16', glow: 'rgba(132, 204, 22, 0.6)' },     // lime gradient
  expert: { from: '#166534', to: '#86efac', mid: '#22c55e', glow: 'rgba(34, 197, 94, 0.6)' },        // green gradient
};

export function SkillVial({ name, level, category, compact = false }: SkillVialProps) {
  const [isHovered, setIsHovered] = useState(false);
  // Fallback to 'intermediate' if level is invalid
  const validLevel = level && level in SKILL_LEVEL_PERCENT ? level : 'intermediate';
  const percent = SKILL_LEVEL_PERCENT[validLevel];
  const gradient = LEVEL_GRADIENTS[validLevel];
  const vialHeight = compact ? 60 : 80;
  const vialWidth = compact ? 24 : 32;
  const liquidHeight = (percent / 100) * (vialHeight - 16); // -16 for top/bottom padding

  // Sanitize name for valid SVG IDs (remove spaces and special characters)
  const safeId = useMemo(() => name.replace(/[^a-zA-Z0-9]/g, '_'), [name]);

  // Memoize the liquid top position to avoid recalculating
  const liquidTop = useMemo(() => vialHeight - 8 - liquidHeight, [vialHeight, liquidHeight]);

  // Generate random bubble positions for hover effect
  const bubbles = isHovered ? [
    { x: vialWidth / 2 - 5, delay: 0, size: 3 },
    { x: vialWidth / 2 + 3, delay: 0.15, size: 2.5 },
    { x: vialWidth / 2 - 2, delay: 0.3, size: 2 },
    { x: vialWidth / 2 + 5, delay: 0.1, size: 2.5 },
    { x: vialWidth / 2, delay: 0.25, size: 3.5 },
    { x: vialWidth / 2 - 4, delay: 0.4, size: 2 },
    { x: vialWidth / 2 + 2, delay: 0.35, size: 1.5 },
  ] : [];

  // Create wave paths with sloshing effect (tilt: positive = higher on left, negative = higher on right)
  const createWavePath = (tilt: number) => {
    // Ensure y is always a valid number to prevent "undefined" in path
    const y = typeof liquidTop === 'number' && !isNaN(liquidTop) ? liquidTop : vialHeight - 8;
    const leftY = y - tilt;
    const rightY = y + tilt;
    return `M 4 ${leftY} Q ${vialWidth / 2} ${y + 2}, ${vialWidth - 4} ${rightY} L ${vialWidth - 4} ${vialHeight + 10} L 4 ${vialHeight + 10} Z`;
  };

  return (
    <div
      className={`flex items-center gap-3 ${compact ? 'py-1' : 'py-2'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Vial SVG */}
      <div className="relative" style={{ width: vialWidth, height: vialHeight }}>
        <svg
          width={vialWidth}
          height={vialHeight}
          viewBox={`0 0 ${vialWidth} ${vialHeight}`}
          className="overflow-visible"
        >
          {/* Defs for gradients and effects */}
          <defs>
            {/* Glow filter */}
            <filter id={`glow-${safeId}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Vertical liquid gradient (bottom to top) - more distinct colors */}
            <linearGradient id={`liquid-gradient-${safeId}`} x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor={gradient.from} />
              <stop offset="50%" stopColor={gradient.mid} />
              <stop offset="100%" stopColor={gradient.to} />
            </linearGradient>

            {/* Cork wood texture gradient */}
            <linearGradient id={`cork-gradient-${safeId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C4A574" />
              <stop offset="25%" stopColor="#A08050" />
              <stop offset="50%" stopColor="#8B6914" />
              <stop offset="75%" stopColor="#A08050" />
              <stop offset="100%" stopColor="#C4A574" />
            </linearGradient>

            {/* Cork highlight */}
            <linearGradient id={`cork-highlight-${safeId}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#DEB887" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8B4513" stopOpacity="0" />
            </linearGradient>

            {/* Clip path for liquid */}
            <clipPath id={`vial-clip-${safeId}`}>
              <rect
                x="4"
                y="10"
                width={vialWidth - 8}
                height={vialHeight - 16}
                rx="4"
              />
            </clipPath>
          </defs>

          {/* Glass vial outline with slight glow */}
          <rect
            x="2"
            y="8"
            width={vialWidth - 4}
            height={vialHeight - 12}
            rx="6"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="2"
          />

          {/* Inner glass edge */}
          <rect
            x="3"
            y="9"
            width={vialWidth - 6}
            height={vialHeight - 14}
            rx="5"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />

          {/* Cork stopper with cartoonish wood styling */}
          <g>
            {/* Cork body */}
            <rect
              x={vialWidth / 2 - 7}
              y="0"
              width="14"
              height="13"
              rx="3"
              fill={`url(#cork-gradient-${safeId})`}
              stroke="#5D4E37"
              strokeWidth="0.5"
            />
            {/* Cork highlight */}
            <rect
              x={vialWidth / 2 - 7}
              y="0"
              width="14"
              height="6"
              rx="3"
              fill={`url(#cork-highlight-${safeId})`}
            />

            {/* Cartoonish cork holes */}
            <ellipse cx={vialWidth / 2 - 3} cy="4" rx="1.5" ry="1" fill="#5D4E37" opacity="0.6" />
            <ellipse cx={vialWidth / 2 + 2} cy="7" rx="1.2" ry="0.8" fill="#5D4E37" opacity="0.5" />
            <ellipse cx={vialWidth / 2 + 4} cy="3" rx="1" ry="0.7" fill="#5D4E37" opacity="0.4" />
            <ellipse cx={vialWidth / 2 - 4} cy="9" rx="0.8" ry="0.6" fill="#5D4E37" opacity="0.5" />
            <ellipse cx={vialWidth / 2} cy="5" rx="0.7" ry="0.5" fill="#5D4E37" opacity="0.35" />
            <ellipse cx={vialWidth / 2 + 3} cy="10" rx="0.9" ry="0.6" fill="#5D4E37" opacity="0.4" />

            {/* Cork grain lines */}
            <line x1={vialWidth / 2 - 4} y1="1" x2={vialWidth / 2 - 5} y2="12" stroke="rgba(93,78,55,0.3)" strokeWidth="0.5" />
            <line x1={vialWidth / 2 + 1} y1="1" x2={vialWidth / 2} y2="12" stroke="rgba(93,78,55,0.25)" strokeWidth="0.5" />
            <line x1={vialWidth / 2 + 5} y1="1" x2={vialWidth / 2 + 4} y2="12" stroke="rgba(93,78,55,0.3)" strokeWidth="0.5" />

            {/* Cork bottom shadow */}
            <rect
              x={vialWidth / 2 - 6}
              y="11"
              width="12"
              height="3"
              fill="rgba(0,0,0,0.35)"
              rx="1"
            />
          </g>

          {/* Liquid with diagonal gradient fill and enhanced wave animation */}
          <g clipPath={`url(#vial-clip-${safeId})`}>
            {/* Liquid body with diagonal gradient */}
            <motion.rect
              x="4"
              initial={{ y: vialHeight - 8 }}
              animate={{ y: liquidTop }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              width={vialWidth - 8}
              height={liquidHeight + 20}
              fill={`url(#liquid-gradient-${safeId})`}
              filter={`url(#glow-${safeId})`}
            />

            {/* Primary wave - sloshing side to side */}
            <motion.path
              fill={`url(#liquid-gradient-${safeId})`}
              fillOpacity="0.9"
              d={createWavePath(0)}
              animate={{
                d: [
                  createWavePath(4),    // Higher on left
                  createWavePath(-4),   // Higher on right
                  createWavePath(4),    // Higher on left
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Secondary wave - offset sloshing for depth */}
            <motion.path
              fill={`url(#liquid-gradient-${safeId})`}
              fillOpacity="0.5"
              d={createWavePath(0)}
              animate={{
                d: [
                  createWavePath(-3),   // Higher on right
                  createWavePath(3),    // Higher on left
                  createWavePath(-3),   // Higher on right
                ],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5,
              }}
            />

            {/* Ambient bubbles */}
            {percent >= 30 && (
              <motion.circle
                cx={vialWidth / 2 - 4}
                r="2.5"
                fill="rgba(255,255,255,0.5)"
                initial={{ cy: vialHeight - 12, opacity: 0.4 }}
                animate={{
                  cy: liquidTop + 5,
                  opacity: [0.4, 0.6, 0],
                }}
                transition={{ duration: 2.8, repeat: Infinity, repeatType: 'loop', delay: 0 }}
              />
            )}
            {percent >= 40 && (
              <motion.circle
                cx={vialWidth / 2 + 4}
                r="2"
                fill="rgba(255,255,255,0.45)"
                initial={{ cy: vialHeight - 10, opacity: 0.35 }}
                animate={{
                  cy: liquidTop + 8,
                  opacity: [0.35, 0.55, 0],
                }}
                transition={{ duration: 2.5, repeat: Infinity, repeatType: 'loop', delay: 0.8 }}
              />
            )}
            {percent >= 60 && (
              <motion.circle
                cx={vialWidth / 2}
                r="1.5"
                fill="rgba(255,255,255,0.4)"
                initial={{ cy: vialHeight - 14, opacity: 0.3 }}
                animate={{
                  cy: liquidTop + 6,
                  opacity: [0.3, 0.5, 0],
                }}
                transition={{ duration: 3.2, repeat: Infinity, repeatType: 'loop', delay: 1.5 }}
              />
            )}
            {percent >= 50 && (
              <motion.circle
                cx={vialWidth / 2 - 2}
                r="1.8"
                fill="rgba(255,255,255,0.45)"
                initial={{ cy: vialHeight - 11, opacity: 0.35 }}
                animate={{
                  cy: liquidTop + 7,
                  opacity: [0.35, 0.5, 0],
                }}
                transition={{ duration: 2.2, repeat: Infinity, repeatType: 'loop', delay: 2 }}
              />
            )}

            {/* Hover bubbles with pop effect */}
            {bubbles.map((bubble, i) => (
              <motion.circle
                key={i}
                cx={bubble.x}
                r={bubble.size}
                fill="rgba(255,255,255,0.6)"
                initial={{ cy: vialHeight - 10, opacity: 0, scale: 0 }}
                animate={{
                  cy: liquidTop - 8,
                  opacity: [0, 0.7, 0],
                  scale: [0, 1, 1.8, 0],
                }}
                transition={{
                  duration: 1,
                  delay: bubble.delay,
                  ease: 'easeOut',
                }}
              />
            ))}
          </g>

          {/* Cartoony glass shine/reflection - main highlight */}
          <rect
            x="5"
            y="14"
            width="5"
            height={vialHeight - 30}
            rx="2.5"
            fill="rgba(255,255,255,0.25)"
          />

          {/* Top shine curve */}
          <ellipse
            cx="8"
            cy="16"
            rx="3"
            ry="2"
            fill="rgba(255,255,255,0.35)"
          />

          {/* Secondary thin highlight */}
          <rect
            x={vialWidth - 8}
            y="18"
            width="2"
            height={vialHeight - 38}
            rx="1"
            fill="rgba(255,255,255,0.12)"
          />

          {/* Bottom subtle reflection */}
          <ellipse
            cx={vialWidth / 2}
            cy={vialHeight - 8}
            rx={vialWidth / 3}
            ry="2"
            fill="rgba(255,255,255,0.08)"
          />
        </svg>
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-medium text-white truncate ${compact ? 'text-sm' : ''}`}>
            {name}
          </span>
          {category && (
            <span className="text-xs px-1.5 py-0.5 bg-white/10 rounded text-white/50 shrink-0">
              {category}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className="text-xs font-medium"
            style={{ color: gradient.to }}
          >
            {SKILL_LEVEL_LABELS[validLevel]}
          </span>
        </div>
      </div>
    </div>
  );
}

// Alternative horizontal bar version for compact lists
export function SkillBar({ name, level }: Pick<SkillVialProps, 'name' | 'level'>) {
  // Fallback to 'intermediate' if level is invalid
  const validLevel = level && level in SKILL_LEVEL_PERCENT ? level : 'intermediate';
  const percent = SKILL_LEVEL_PERCENT[validLevel];
  const gradient = LEVEL_GRADIENTS[validLevel];

  return (
    <div className="py-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-white">{name}</span>
        <span className="text-xs text-white/50">{SKILL_LEVEL_LABELS[validLevel]}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${gradient.from}, ${gradient.mid}, ${gradient.to})`
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
