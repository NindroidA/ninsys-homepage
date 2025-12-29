import { motion } from 'framer-motion';
import type { FloatingElementsProps } from './types';

export function FloatingElements({
    variant = 'default',
    intensity = 'medium'
}: FloatingElementsProps) {
    const intensities = {
        low: 0.3,
        medium: 0.5,
        high: 0.7
    };

    const maxOpacity = intensities[intensity];

    const variants = {
        default: [
            { colors: 'bg-purple-500/10', size: 'w-64 h-64', position: 'top-1/4 left-1/4' },
            { colors: 'bg-pink-500/10', size: 'w-48 h-48', position: 'bottom-1/4 right-1/4' },
            { colors: 'bg-cyan-500/10', size: 'w-32 h-32', position: 'top-3/4 left-3/4' }
        ],
        purple: [
            { colors: 'bg-purple-400/15', size: 'w-80 h-80', position: 'top-1/4 right-1/4' },
            { colors: 'bg-violet-500/10', size: 'w-64 h-64', position: 'top-1/2 left-1/4' },
            { colors: 'bg-pink-400/10', size: 'w-56 h-56', position: 'bottom-1/4 left-1/2' }
        ],
        blue: [
            { colors: 'bg-blue-400/15', size: 'w-72 h-72', position: 'top-1/3 right-1/3' },
            { colors: 'bg-cyan-500/10', size: 'w-64 h-64', position: 'bottom-1/3 left-1/4' },
            { colors: 'bg-teal-400/10', size: 'w-48 h-48', position: 'top-2/3 right-1/4' }
        ],
        rainbow: [
            { colors: 'bg-red-400/10', size: 'w-64 h-64', position: 'top-1/4 right-1/4' },
            { colors: 'bg-yellow-400/8', size: 'w-72 h-72', position: 'top-1/3 left-1/4' },
            { colors: 'bg-blue-400/10', size: 'w-56 h-56', position: 'bottom-1/3 right-1/3' },
            { colors: 'bg-purple-400/10', size: 'w-48 h-48', position: 'bottom-1/4 left-1/3' }
        ],
        minimal: [
            { colors: 'bg-purple-400/8', size: 'w-48 h-48', position: 'top-1/4 right-1/3' },
            { colors: 'bg-blue-400/8', size: 'w-48 h-48', position: 'bottom-1/4 left-1/3' }
        ]
    };

    const elements = variants[variant];

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {elements.map((element, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: maxOpacity * 0.5 }}
                    animate={{
                        x: [0, (index + 1) * 30, 0],
                        y: [0, -(index + 1) * 20, 0],
                        opacity: [maxOpacity * 0.5, maxOpacity, maxOpacity * 0.5]
                    }}
                    transition={{
                        duration: 8 + index * 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: index * 2
                    }}
                    className={`absolute ${element.position} ${element.size} ${element.colors} rounded-full blur-3xl`}
                />
            ))}
        </div>
    );
}
