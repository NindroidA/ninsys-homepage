import { motion } from 'framer-motion';
import type { SectionProps } from './types';

export function Section({
    children,
    title,
    subtitle,
    className = '',
    background = 'none',
    padding = 'lg',
    maxWidth = '6xl',
    titleIcon,
    centered = true
}: SectionProps) {
    const backgrounds = {
        none: '',
        subtle: 'bg-gradient-to-b from-white/5 via-transparent to-white/5 backdrop-blur-3xl',
        gradient: 'bg-gradient-to-br from-purple-900/20 via-transparent to-indigo-900/20',
        dark: 'bg-gradient-to-br from-slate-900/50 via-purple-950/50 to-indigo-950/50 backdrop-blur-xl',
        purple: 'bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-purple-500/10 backdrop-blur-xl'
    };

    const paddings = {
        none: 'py-0 px-0',
        sm: 'py-12 px-6',
        md: 'py-16 px-8',
        lg: 'py-20 px-8',
        xl: 'py-32 px-8',
        '2xl': 'py-40 px-8'
    };

    const maxWidths = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '4xl': 'max-w-4xl',
        '6xl': 'max-w-6xl',
        '7xl': 'max-w-7xl',
        full: 'max-w-full'
    };

    return (
        <section className={`relative ${paddings[padding]} ${backgrounds[background]} ${className}`}>
            <div className={`${maxWidths[maxWidth]} mx-auto`}>
                {(title || subtitle) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                        className={`mb-16 ${centered ? 'text-center' : ''}`}
                    >
                        {title && (
                            <div className={`flex items-center gap-3 mb-4 ${centered ? 'justify-center' : ''}`}>
                                {titleIcon && <span className="text-2xl">{titleIcon}</span>}
                                <h2 className="text-4xl md:text-5xl font-bold text-white">
                                    <span className="bg-gradient-to-r from-violet-400 via-purple-500 to-pink-400 bg-clip-text text-transparent">
                                        {title}
                                    </span>
                                </h2>
                            </div>
                        )}
                        {subtitle && (
                            <p className={`text-xl text-white/70 ${centered ? 'max-w-3xl mx-auto' : ''} leading-relaxed`}>
                                {subtitle}
                            </p>
                        )}
                    </motion.div>
                )}
                {children}
            </div>
        </section>
    );
}
