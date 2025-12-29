import type { ReactNode } from 'react';

// ===== Badge ===== //
export interface BadgeProps {
    children: ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'pink' | 'cyan';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    icon?: ReactNode;
    pulse?: boolean;
}

// ===== Button ===== //
export interface ButtonProps {
    children: ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'ghost' | 'gradient' | 'glass' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    className?: string;
    href?: string;
    target?: string;
    type?: 'button' | 'submit' | 'reset';
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
}

// ===== Card ===== //
export interface CardProps {
    children: ReactNode;
    className?: string;
    variant?: 'default' | 'glass' | 'elevated' | 'minimal' | 'gradient' | 'bordered';
    hover?: boolean;
    animate?: boolean;
    delay?: number;
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    onClick?: () => void;
}

// ===== Floating Elements ===== //
export interface FloatingElementsProps {
    variant?: 'default' | 'purple' | 'blue' | 'rainbow' | 'minimal';
    intensity?: 'low' | 'medium' | 'high';
}

// ===== Gradient Text ===== //
export interface GradientTextProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'accent' | 'purple' | 'pink' | 'blue' | 'rainbow' | 'sunset' | 'ocean';
    className?: string;
    animated?: boolean;
}

// ===== Grid ===== //
export interface GridProps {
    children: ReactNode;
    cols?: 1 | 2 | 3 | 4 | 5 | 6;
    gap?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    responsive?: boolean;
}

// ===== Section ===== //
export interface SectionProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
    className?: string;
    background?: 'none' | 'subtle' | 'gradient' | 'dark' | 'purple';
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'full';
    titleIcon?: ReactNode;
    centered?: boolean;
}
