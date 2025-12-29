import { motion } from 'framer-motion';
import type { CardProps } from './types';

export function Card({
    children,
    className = '',
    variant = 'default',
    hover = true,
    animate = true,
    delay = 0,
    padding = 'lg',
    onClick
}: CardProps) {
    const baseClasses = 'rounded-3xl border transition-all duration-500';

    const variants = {
        default: 'bg-gradient-to-br from-white/12 via-gray-800/20 to-white/8 backdrop-blur-xl border-white/20',
        glass: 'bg-white/5 backdrop-blur-2xl border-white/10 shadow-2xl',
        elevated: 'bg-gradient-to-br from-white/15 via-gray-700/25 to-white/10 backdrop-blur-xl border-white/30 shadow-2xl',
        minimal: 'bg-white/8 backdrop-blur-lg border-white/15',
        gradient: 'bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-indigo-500/10 backdrop-blur-xl border-purple-400/20',
        bordered: 'bg-gradient-to-br from-white/10 via-gray-800/15 to-white/5 backdrop-blur-xl border-white/30'
    };

    const paddings = {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-12'
    };

    const hoverClasses = hover
        ? 'hover:border-white/30 hover:shadow-2xl hover:shadow-purple-500/10 hover:bg-gradient-to-br hover:from-white/15 hover:via-gray-700/25 hover:to-white/10'
        : '';

    const classes = `${baseClasses} ${variants[variant]} ${paddings[padding]} ${hoverClasses} ${onClick ? 'cursor-pointer' : ''} ${className}`;

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

    return <div className={classes} onClick={onClick}>{children}</div>;
}
