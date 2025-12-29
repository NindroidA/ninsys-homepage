import { motion } from 'framer-motion';
import type { ButtonProps } from './types';

export function Button({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    disabled = false,
    className = '',
    href,
    target,
    type = 'button',
    icon,
    iconPosition = 'left',
    fullWidth = false
}: ButtonProps) {
    const baseClasses = 'rounded-xl font-semibold transition-all duration-300 flex items-center justify-center border';

    const variants = {
        primary: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-transparent hover:shadow-lg hover:shadow-purple-500/25',
        secondary: 'bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 backdrop-blur-sm hover:shadow-lg',
        ghost: 'bg-transparent hover:bg-white/10 text-white/80 hover:text-white border-transparent',
        gradient: 'bg-gradient-to-r from-violet-400 via-purple-700 to-pink-300 hover:from-violet-500 hover:via-purple-800 hover:to-pink-400 text-white border-transparent hover:shadow-lg hover:shadow-purple-500/30 animate-gradient',
        glass: 'bg-gradient-to-r from-purple-500/20 via-gray-700/30 to-pink-500/20 hover:from-purple-500/30 hover:via-gray-600/40 hover:to-pink-500/30 backdrop-blur-sm border-white/20 hover:border-white/30 text-purple-200 hover:text-white hover:shadow-lg hover:shadow-purple-500/20',
        outline: 'bg-transparent hover:bg-purple-500/10 text-purple-300 border-purple-400/50 hover:border-purple-400/80 hover:shadow-lg hover:shadow-purple-500/20'
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm gap-2',
        md: 'px-6 py-3 text-base gap-2',
        lg: 'px-8 py-4 text-lg gap-3'
    };

    const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`;

    const content = (
        <>
            {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
            {children}
            {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
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
            <a href={href} target={target} className="inline-block" style={{ width: fullWidth ? '100%' : 'auto' }}>
                {motionContent}
            </a>
        );
    }

    return (
        <button type={type} disabled={disabled} className="inline-block" style={{ width: fullWidth ? '100%' : 'auto' }}>
            {motionContent}
        </button>
    );
}
