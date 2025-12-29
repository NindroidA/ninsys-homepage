import type { GradientTextProps } from './types';

export function GradientText({
    children,
    variant = 'primary',
    className = '',
    animated = false
}: GradientTextProps) {
    const variants = {
        primary: 'bg-gradient-to-r from-violet-400 via-purple-700 to-pink-300',
        secondary: 'bg-gradient-to-r from-cyan-400 to-blue-500',
        accent: 'bg-gradient-to-r from-emerald-400 to-cyan-500',
        purple: 'bg-gradient-to-r from-violet-400 via-purple-500 to-pink-400',
        pink: 'bg-gradient-to-r from-pink-400 via-rose-400 to-red-400',
        blue: 'bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400',
        rainbow: 'bg-gradient-to-r from-violet-400 via-pink-400 via-yellow-400 to-green-400',
        sunset: 'bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600',
        ocean: 'bg-gradient-to-r from-blue-400 via-cyan-500 to-emerald-400'
    };

    return (
        <span className={`${variants[variant]} bg-clip-text text-transparent ${animated ? 'animate-gradient' : ''} ${className}`}>
            {children}
        </span>
    );
}
