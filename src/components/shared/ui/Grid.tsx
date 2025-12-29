import type { GridProps } from './types';

export function Grid({
    children,
    cols = 3,
    gap = 'lg',
    className = '',
    responsive = true
}: GridProps) {
    const colClasses = {
        1: responsive ? 'grid-cols-1' : 'grid-cols-1',
        2: responsive ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2',
        3: responsive ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-3',
        4: responsive ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-4',
        5: responsive ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5' : 'grid-cols-5',
        6: responsive ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6' : 'grid-cols-6'
    };

    const gapClasses = {
        sm: 'gap-4',
        md: 'gap-6',
        lg: 'gap-8',
        xl: 'gap-12'
    };

    return (
        <div className={`grid ${colClasses[cols]} ${gapClasses[gap]} ${className}`}>
            {children}
        </div>
    );
}
