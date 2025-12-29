import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge, Button, Card } from '../shared/ui';
import { Calendar, ChevronDown, ChevronUp, Edit2, ExternalLink, Github, Globe, GripVertical, Star, Tag, Trash2 } from 'lucide-react';
import { Project } from '../../types/projects';

interface ProjectCardProps {
  project: Project;
  index: number;
  isEditing: boolean;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export function ProjectCard({ project, index, isEditing, onEdit, onDelete, onMoveUp, onMoveDown, isFirst, isLast }: ProjectCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id, disabled: !isEditing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card delay={index * 0.1} padding="lg" className={isDragging ? 'ring-2 ring-purple-500' : ''}>
        {/* Drag handle and edit controls */}
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
                onClick={() => onEdit?.(project)}
                className="p-2 rounded bg-white/5 hover:bg-purple-500/20 text-white/60 hover:text-purple-300 transition-colors"
                title="Edit project"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete?.(project)}
                className="p-2 rounded bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-300 transition-colors"
                title="Delete project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Project header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-2">{project.title}</h3>
            <div className="flex items-center gap-3 text-sm text-white/60">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {project.date}
              </div>
              <Badge variant={project.category === 'current' ? 'success' : 'info'}>
                {project.category}
              </Badge>
            </div>
          </div>
          {project.featured && (
            <Badge variant="purple" className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              Featured
            </Badge>
          )}
        </div>

        {/* Description */}
        <p className="text-white/70 mb-6 leading-relaxed">{project.description}</p>

        {/* Technologies */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-purple-300" />
            <span className="text-sm font-medium text-white/60">Technologies</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <Badge key={tech} variant="default" size="sm">
                {tech}
              </Badge>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="flex gap-3">
          {project.githubUrl && (
            <Button
              href={project.githubUrl}
              target="_blank"
              variant="secondary"
              size="sm"
              icon={<Github className="w-4 h-4" />}
            >
              Code
            </Button>
          )}
          {project.liveUrl && (
            <Button
              href={project.liveUrl}
              target="_blank"
              variant="glass"
              size="sm"
              icon={<Globe className="w-4 h-4" />}
              iconPosition="right"
            >
              Live Demo
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
