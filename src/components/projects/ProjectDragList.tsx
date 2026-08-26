import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import type { Project } from "../../types/projects";
import { Grid } from "../shared/ui";
import { ProjectCard } from "./ProjectCard";

interface ProjectDragListProps {
  /** The projects actually rendered — may be a filtered subset of `allProjects`. */
  projects: Project[];
  /**
   * Every project, unfiltered. Reordering happens on the visible subset, but both
   * the query cache and the reorder endpoint expect the complete list — writing
   * back only the subset would drop the hidden projects.
   */
  allProjects: Project[];
  isEditing: boolean;
  onReorder: (projectIds: string[]) => Promise<boolean>;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  setLocalProjects: (projects: Project[]) => void;
}

export function ProjectDragList({
  projects,
  allProjects,
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
    }),
  );

  /**
   * Fold a reordered *visible* list back into the full list, by refilling the
   * slots the visible projects occupied. Projects hidden by the active filter
   * keep their positions, so reordering under a filter no longer drops them
   * from the cache or from the ids sent to the server.
   */
  const mergeIntoAll = (reorderedVisible: Project[]): Project[] => {
    const visibleIds = new Set(projects.map((p) => p.id));
    let next = 0;
    return allProjects.map((p) => (visibleIds.has(p.id) ? (reorderedVisible[next++] ?? p) : p));
  };

  const persistReorder = async (reorderedVisible: Project[]) => {
    const newAll = mergeIntoAll(reorderedVisible);
    const previous = allProjects; // for rollback

    setLocalProjects(newAll); // optimistic
    const success = await onReorder(newAll.map((p) => p.id));
    if (!success) {
      setLocalProjects(previous);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = projects.findIndex((p) => p.id === active.id);
    const newIndex = projects.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    await persistReorder(arrayMove(projects, oldIndex, newIndex));
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    await persistReorder(arrayMove(projects, index, index - 1));
  };

  const handleMoveDown = async (index: number) => {
    if (index === projects.length - 1) return;
    await persistReorder(arrayMove(projects, index, index + 1));
  };

  if (!isEditing) {
    // Non-editing mode - just render grid without drag
    return (
      <Grid cols={2} gap="lg">
        {projects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} isEditing={false} />
        ))}
      </Grid>
    );
  }

  // Editing mode - render with drag functionality
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={projects.map((p) => p.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
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
