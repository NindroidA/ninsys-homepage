import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Grid } from '../shared/ui';
import { Project } from '../../types/projects';
import { ProjectCard } from './ProjectCard';

interface ProjectDragListProps {
  projects: Project[];
  isEditing: boolean;
  onReorder: (projectIds: string[]) => Promise<boolean>;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  setLocalProjects: (projects: Project[]) => void;
}

export function ProjectDragList({
  projects,
  isEditing,
  onReorder,
  onEdit,
  onDelete,
  setLocalProjects,
}: ProjectDragListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = projects.findIndex((p) => p.id === active.id);
      const newIndex = projects.findIndex((p) => p.id === over.id);

      const previousProjects = [...projects]; // Store for rollback
      const newProjects = arrayMove(projects, oldIndex, newIndex);

      // Optimistic update
      setLocalProjects(newProjects);

      // Persist to backend
      const projectIds = newProjects.map((p) => p.id);
      const success = await onReorder(projectIds);

      // Rollback on failure
      if (!success) {
        setLocalProjects(previousProjects);
      }
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const previousProjects = [...projects];
    const newProjects = arrayMove(projects, index, index - 1);
    setLocalProjects(newProjects);
    const success = await onReorder(newProjects.map((p) => p.id));
    if (!success) {
      setLocalProjects(previousProjects);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === projects.length - 1) return;
    const previousProjects = [...projects];
    const newProjects = arrayMove(projects, index, index + 1);
    setLocalProjects(newProjects);
    const success = await onReorder(newProjects.map((p) => p.id));
    if (!success) {
      setLocalProjects(previousProjects);
    }
  };

  if (!isEditing) {
    // Non-editing mode - just render grid without drag
    return (
      <Grid cols={2} gap="lg">
        {projects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={index}
            isEditing={false}
          />
        ))}
      </Grid>
    );
  }

  // Editing mode - render with drag functionality
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={projects.map((p) => p.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              isEditing={true}
              onEdit={onEdit}
              onDelete={onDelete}
              onMoveUp={() => handleMoveUp(index)}
              onMoveDown={() => handleMoveDown(index)}
              isFirst={index === 0}
              isLast={index === projects.length - 1}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
