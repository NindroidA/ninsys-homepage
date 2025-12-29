import type { BadgeProps } from './types';

export function Badge({
    children,
    variant = 'default',
    size = 'md',
    className = '',
    icon,
    pulse = false
}: BadgeProps) {
    const variants = {
        default: 'bg-white/10 text-white/90 border-white/20 hover:bg-white/20',
        success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30',
        warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30',
        error: 'bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30',
        info: 'bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30',
        purple: 'bg-purple-500/20 text-purple-300 border-purple-400/30 hover:bg-purple-500/30',
        pink: 'bg-pink-500/20 text-pink-300 border-pink-400/30 hover:bg-pink-500/30',
        cyan: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30 hover:bg-cyan-500/30',
    };

    const sizes = {
        sm: 'px-2 py-1 text-xs gap-1',
        md: 'px-3 py-1.5 text-sm gap-1.5',
        lg: 'px-4 py-2 text-base gap-2'
    };

    return (
        <span
            className={`inline-flex items-center rounded-xl border backdrop-blur-sm font-medium transition-all duration-200 ${variants[variant]} ${sizes[size]} ${pulse ? 'animate-pulse' : ''} ${className}`}
        >
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {children}
        </span>
    );
}
