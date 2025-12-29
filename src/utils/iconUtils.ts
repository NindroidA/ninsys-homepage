import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

// Get a Lucide icon component by name
export function getLucideIcon(name: string): LucideIcon | null {
  // Convert various formats to PascalCase
  const iconName = name
    .split(/[-_\s]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');

  // Try to find the icon
  const icon = (LucideIcons as Record<string, unknown>)[iconName];

  if (typeof icon === 'function') {
    return icon as LucideIcon;
  }

  // Try with "Icon" suffix removed or added
  const iconWithoutSuffix = iconName.replace(/Icon$/, '');
  const iconWithSuffix = iconName + 'Icon';

  const altIcon = (LucideIcons as Record<string, unknown>)[iconWithoutSuffix] ||
                  (LucideIcons as Record<string, unknown>)[iconWithSuffix];

  if (typeof altIcon === 'function') {
    return altIcon as LucideIcon;
  }

  return null;
}

// Common icons for sections
export const SECTION_ICONS = [
  { name: 'Code2', label: 'Code' },
  { name: 'Heart', label: 'Heart' },
  { name: 'Briefcase', label: 'Briefcase' },
  { name: 'GraduationCap', label: 'Graduation' },
  { name: 'Sparkles', label: 'Sparkles' },
  { name: 'Star', label: 'Star' },
  { name: 'Zap', label: 'Zap' },
  { name: 'Rocket', label: 'Rocket' },
  { name: 'Trophy', label: 'Trophy' },
  { name: 'Target', label: 'Target' },
  { name: 'Lightbulb', label: 'Lightbulb' },
  { name: 'Palette', label: 'Palette' },
  { name: 'Music', label: 'Music' },
  { name: 'Gamepad2', label: 'Gaming' },
  { name: 'Camera', label: 'Camera' },
  { name: 'Book', label: 'Book' },
  { name: 'Coffee', label: 'Coffee' },
  { name: 'Globe', label: 'Globe' },
  { name: 'Users', label: 'Users' },
  { name: 'Award', label: 'Award' },
] as const;
