import { useCallback, useEffect, useState } from 'react';
import { CreateProjectInput, Project, UpdateProjectInput } from '../types/projects';
import { safeFetch } from '../utils/apiHelpers';
import { ninsysAPI } from '../utils/ninsysAPI';

/**
 * Return type for the useProjects hook
 * @property projects - Array of projects sorted by order field
 * @property loading - True while initial fetch is in progress
 * @property error - Error message from the most recent failed operation, or null
 * @property refresh - Refetch all projects from the API
 * @property createProject - Create a new project, returns the created project or null on error
 * @property updateProject - Update an existing project by ID, returns updated project or null
 * @property deleteProject - Delete a project by ID, returns true on success
 * @property reorderProjects - Reorder projects by passing array of IDs in new order
 * @property addProject - Add a project to local state (used after GitHub import)
 * @property setLocalProjects - Directly set local projects array (for optimistic updates)
 */
interface UseProjectsReturn {
  projects: Project[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createProject: (input: CreateProjectInput) => Promise<Project | null>;
  updateProject: (id: string, input: UpdateProjectInput) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;
  reorderProjects: (projectIds: string[]) => Promise<boolean>;
  addProject: (project: Project) => void;
  setLocalProjects: (projects: Project[]) => void;
}

/**
 * Hook for managing projects with CRUD operations and drag-and-drop reordering.
 * Fetches projects on mount and provides methods for create, update, delete, and reorder.
 * Includes optimistic update support via setLocalProjects for smooth drag-and-drop UX.
 *
 * @example
 * const { projects, loading, createProject, reorderProjects } = useProjects();
 */
export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await safeFetch(
      () => ninsysAPI.getProjects(),
      [] as Project[]
    );

    // Sort by order field
    const sorted = [...result].sort((a, b) => a.order - b.order);
    setProjects(sorted);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = useCallback(async (input: CreateProjectInput): Promise<Project | null> => {
    try {
      setError(null);
      const newProject = await ninsysAPI.createProject(input);
      setProjects((prev) => [...prev, newProject].sort((a, b) => a.order - b.order));
      return newProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      return null;
    }
  }, []);

  const updateProject = useCallback(async (id: string, input: UpdateProjectInput): Promise<Project | null> => {
    try {
      setError(null);
      const updated = await ninsysAPI.updateProject(id, input);
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? updated : p)).sort((a, b) => a.order - b.order)
      );
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
      return null;
    }
  }, []);

  const deleteProject = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await ninsysAPI.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
      return false;
    }
  }, []);

  const reorderProjects = useCallback(async (projectIds: string[]): Promise<boolean> => {
    try {
      setError(null);
      await ninsysAPI.reorderProjects(projectIds);
      // Refresh to get updated order values
      await fetchProjects();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder projects');
      // Refresh to revert optimistic update
      await fetchProjects();
      return false;
    }
  }, [fetchProjects]);

  const setLocalProjects = useCallback((newProjects: Project[]) => {
    setProjects(newProjects);
  }, []);

  // Add a project to local state (for imported projects)
  const addProject = useCallback((project: Project) => {
    setProjects((prev) => [...prev, project].sort((a, b) => a.order - b.order));
  }, []);

  return {
    projects,
    loading,
    error,
    refresh: fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    reorderProjects,
    addProject,
    setLocalProjects,
  };
}
