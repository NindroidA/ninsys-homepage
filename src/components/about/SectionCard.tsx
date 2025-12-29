import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge, Card, Grid } from '../shared/ui';
import { ChevronDown, ChevronUp, Edit2, GripVertical, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import {
  AboutSection,
  isEducationContent,
  isExperienceContent,
  isInterestsContent,
  isSkillsContent,
  SectionSize,
} from '../../types/about';
import { getLucideIcon } from '../../utils/iconUtils';
import { SkillVial } from './SkillVial';

interface SectionCardProps {
  section: AboutSection;
  index: number;
  isEditing: boolean;
  onEdit?: (section: AboutSection) => void;
  onDelete?: (section: AboutSection) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

// Size to grid span mapping
const SIZE_CLASSES: Record<SectionSize, string> = {
  small: 'col-span-1',
  medium: 'col-span-1 lg:col-span-1',
  large: 'col-span-1 lg:col-span-2',
};

export function SectionCard({ section, index, isEditing, onEdit, onDelete, onMoveUp, onMoveDown, isFirst, isLast }: SectionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id, disabled: !isEditing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  const IconComponent = useMemo(() => {
    if (!section.icon) return null;
    return getLucideIcon(section.icon);
  }, [section.icon]);

  return (
    <div ref={setNodeRef} style={style} className={SIZE_CLASSES[section.size]}>
      <Card delay={index * 0.1} padding="lg" className={isDragging ? 'ring-2 ring-purple-500' : ''}>
        {/* Edit controls */}
        {isEditing && (
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10 gap-2">
            {/* Drag handle (hidden on very small screens) + Move buttons */}
            <div className="flex items-center gap-1">
              <button
                {...attributes}
                {...listeners}
                className="hidden sm:flex items-center gap-2 px-2 py-1.5 rounded bg-white/5 hover:bg-white/10 text-white/60 cursor-grab active:cursor-grabbing transition-colors"
                title="Drag to reorder"
              >
                <GripVertical className="w-4 h-4" />
                <span className="text-xs font-medium hidden md:inline">Drag</span>
              </button>
              {/* Move up/down buttons (always visible, more touch-friendly) */}
              <button
                onClick={onMoveUp}
                disabled={isFirst}
                className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Move up"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={onMoveDown}
                disabled={isLast}
                className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Move down"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit?.(section)}
                className="p-2 rounded bg-white/5 hover:bg-purple-500/20 text-white/60 hover:text-purple-300 transition-colors"
                title="Edit section"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete?.(section)}
                className="p-2 rounded bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-300 transition-colors"
                title="Delete section"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Section header */}
        <div className="flex items-center gap-3 mb-6">
          {IconComponent && (
            <IconComponent className="w-6 h-6 text-purple-300" />
          )}
          <h2 className="text-2xl font-bold text-white">{section.title}</h2>
        </div>

        {/* Section content */}
        <SectionContent section={section} />
      </Card>
    </div>
  );
}

// Render section content based on type
function SectionContent({ section }: { section: AboutSection }) {
  const { content, type } = section;

  // Skills section with vials
  if (type === 'skills' && isSkillsContent(content)) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {content.skills.map((skill, i) => (
          <SkillVial
            key={i}
            name={skill.name}
            level={skill.level}
            category={skill.category}
            compact
          />
        ))}
      </div>
    );
  }

  // Interests section
  if (type === 'interests' && isInterestsContent(content)) {
    return (
      <Grid cols={2} gap="sm">
        {content.interests.map((interest, i) => (
          <Badge key={i} variant="default" size="sm">
            {interest.emoji} {interest.label}
          </Badge>
        ))}
      </Grid>
    );
  }

  // Experience section
  if (type === 'experience' && isExperienceContent(content)) {
    return (
      <div className="space-y-6">
        {content.items.map((exp, i) => (
          <div key={i} className="border-l-2 border-purple-400/30 pl-6">
            <h3 className="text-xl font-semibold text-white mb-1">{exp.title}</h3>
            <div className="text-purple-300 mb-2">
              {exp.company} &bull; {exp.period}
            </div>
            <p className="text-white/70">{exp.description}</p>
          </div>
        ))}
      </div>
    );
  }

  // Education section
  if (type === 'education' && isEducationContent(content)) {
    return (
      <div className="space-y-6">
        {content.items.map((edu, i) => (
          <div key={i} className="border-l-2 border-emerald-400/30 pl-6">
            <h3 className="text-xl font-semibold text-white mb-1">{edu.degree}</h3>
            <div className="text-emerald-300 mb-2">
              {edu.school} &bull; {edu.period}
            </div>
            <p className="text-white/70">{edu.description}</p>
          </div>
        ))}
      </div>
    );
  }

  // Custom HTML section
  if (type === 'custom' && 'html' in content) {
    return (
      <div
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: content.html }}
      />
    );
  }

  return null;
}
