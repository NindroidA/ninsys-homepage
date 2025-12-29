import { motion } from 'framer-motion';
import { SKILL_LEVEL_LABELS, SKILL_LEVEL_PERCENT, SkillLevel } from '../../types/about';

interface SkillVialProps {
  name: string;
  level: SkillLevel;
  category?: string;
  compact?: boolean;
}

// Color gradient based on level
const LEVEL_COLORS: Record<SkillLevel, { fill: string; glow: string }> = {
  novice: { fill: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' },      // red
  beginner: { fill: '#f97316', glow: 'rgba(249, 115, 22, 0.4)' },   // orange
  intermediate: { fill: '#eab308', glow: 'rgba(234, 179, 8, 0.4)' }, // yellow
  advanced: { fill: '#84cc16', glow: 'rgba(132, 204, 22, 0.4)' },    // lime
  expert: { fill: '#22c55e', glow: 'rgba(34, 197, 94, 0.4)' },       // green
};

export function SkillVial({ name, level, category, compact = false }: SkillVialProps) {
  // Fallback to 'intermediate' if level is invalid
  const validLevel = level && level in SKILL_LEVEL_PERCENT ? level : 'intermediate';
  const percent = SKILL_LEVEL_PERCENT[validLevel];
  const colors = LEVEL_COLORS[validLevel];
  const vialHeight = compact ? 60 : 80;
  const vialWidth = compact ? 24 : 32;
  const liquidHeight = (percent / 100) * (vialHeight - 16); // -16 for top/bottom padding

  return (
    <div className={`flex items-center gap-3 ${compact ? 'py-1' : 'py-2'}`}>
      {/* Vial SVG */}
      <div className="relative" style={{ width: vialWidth, height: vialHeight }}>
        <svg
          width={vialWidth}
          height={vialHeight}
          viewBox={`0 0 ${vialWidth} ${vialHeight}`}
          className="overflow-visible"
        >
          {/* Glow effect */}
          <defs>
            <filter id={`glow-${name}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Wave pattern */}
            <clipPath id={`vial-clip-${name}`}>
              <rect
                x="4"
                y="8"
                width={vialWidth - 8}
                height={vialHeight - 16}
                rx="4"
              />
            </clipPath>
          </defs>

          {/* Vial outline */}
          <rect
            x="2"
            y="6"
            width={vialWidth - 4}
            height={vialHeight - 12}
            rx="6"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="2"
          />

          {/* Cork stopper */}
          <defs>
            <linearGradient id={`cork-gradient-${name}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B6914" />
              <stop offset="30%" stopColor="#A67C00" />
              <stop offset="70%" stopColor="#8B6914" />
              <stop offset="100%" stopColor="#6B4F0A" />
            </linearGradient>
          </defs>
          <rect
            x={vialWidth / 2 - 5}
            y="0"
            width="10"
            height="10"
            rx="2"
            fill={`url(#cork-gradient-${name})`}
          />
          {/* Cork grain lines */}
          <line
            x1={vialWidth / 2 - 3}
            y1="2"
            x2={vialWidth / 2 - 3}
            y2="8"
            stroke="rgba(0,0,0,0.15)"
            strokeWidth="0.5"
          />
          <line
            x1={vialWidth / 2}
            y1="1"
            x2={vialWidth / 2}
            y2="9"
            stroke="rgba(0,0,0,0.1)"
            strokeWidth="0.5"
          />
          <line
            x1={vialWidth / 2 + 3}
            y1="2"
            x2={vialWidth / 2 + 3}
            y2="8"
            stroke="rgba(0,0,0,0.15)"
            strokeWidth="0.5"
          />

          {/* Liquid with wave animation */}
          <g clipPath={`url(#vial-clip-${name})`}>
            {/* Liquid body */}
            <motion.rect
              x="4"
              initial={{ y: vialHeight - 8 }}
              animate={{ y: vialHeight - 8 - liquidHeight }}
              transition={{ duration: 1, ease: 'easeOut' }}
              width={vialWidth - 8}
              height={liquidHeight + 20} // Extra height to cover animation
              fill={colors.fill}
              filter={`url(#glow-${name})`}
              style={{ boxShadow: `0 0 10px ${colors.glow}` }}
            />

            {/* Wave effect - animated path */}
            <motion.path
              d={`M 4 ${vialHeight - 8 - liquidHeight}
                  Q ${vialWidth / 4} ${vialHeight - 12 - liquidHeight}, ${vialWidth / 2} ${vialHeight - 8 - liquidHeight}
                  T ${vialWidth - 4} ${vialHeight - 8 - liquidHeight}`}
              fill={colors.fill}
              initial={{ opacity: 0 }}
              animate={{
                d: [
                  `M 4 ${vialHeight - 8 - liquidHeight}
                   Q ${vialWidth / 4} ${vialHeight - 12 - liquidHeight}, ${vialWidth / 2} ${vialHeight - 8 - liquidHeight}
                   T ${vialWidth - 4} ${vialHeight - 8 - liquidHeight}`,
                  `M 4 ${vialHeight - 8 - liquidHeight}
                   Q ${vialWidth / 4} ${vialHeight - 4 - liquidHeight}, ${vialWidth / 2} ${vialHeight - 8 - liquidHeight}
                   T ${vialWidth - 4} ${vialHeight - 8 - liquidHeight}`,
                  `M 4 ${vialHeight - 8 - liquidHeight}
                   Q ${vialWidth / 4} ${vialHeight - 12 - liquidHeight}, ${vialWidth / 2} ${vialHeight - 8 - liquidHeight}
                   T ${vialWidth - 4} ${vialHeight - 8 - liquidHeight}`,
                ],
                opacity: 1,
              }}
              transition={{
                d: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                opacity: { duration: 1 },
              }}
            />

            {/* Bubble effects */}
            {percent >= 40 && (
              <motion.circle
                cx={vialWidth / 2 - 3}
                r="2"
                fill="rgba(255,255,255,0.4)"
                initial={{ cy: vialHeight - 12 }}
                animate={{ cy: vialHeight - 8 - liquidHeight + 5 }}
                transition={{ duration: 3, repeat: Infinity, repeatType: 'loop', delay: 0.5 }}
              />
            )}
            {percent >= 60 && (
              <motion.circle
                cx={vialWidth / 2 + 4}
                r="1.5"
                fill="rgba(255,255,255,0.3)"
                initial={{ cy: vialHeight - 10 }}
                animate={{ cy: vialHeight - 8 - liquidHeight + 8 }}
                transition={{ duration: 2.5, repeat: Infinity, repeatType: 'loop', delay: 1 }}
              />
            )}
          </g>

          {/* Glass highlight */}
          <rect
            x="6"
            y="10"
            width="3"
            height={vialHeight - 24}
            rx="1.5"
            fill="rgba(255,255,255,0.1)"
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
            style={{ color: colors.fill }}
          >
            {SKILL_LEVEL_LABELS[validLevel]}
          </span>
          <span className="text-xs text-white/40">{percent}%</span>
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
  const colors = LEVEL_COLORS[validLevel];

  return (
    <div className="py-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-white">{name}</span>
        <span className="text-xs text-white/50">{SKILL_LEVEL_LABELS[validLevel]}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: colors.fill }}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
