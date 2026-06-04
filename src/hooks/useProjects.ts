import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryClient";
import type { CreateProjectInput, Project, UpdateProjectInput } from "../types/projects";
import { ninsysAPI } from "../utils/ninsysAPI";

interface UseProjectsReturn {
  projects: Project[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createProject: (input: CreateProjectInput) => Promise<Project | null>;
  updateProject: (id: string, input: UpdateProjectInput) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;
  reorderProjects: (projectIds: string[]) => Promise<boolean>;
  /** Optimistic local update (e.g. drag-and-drop) — writes straight to the cache. */
  setLocalProjects: (projects: Project[]) => void;
}

const sortByOrder = (projects: Project[]) => [...projects].sort((a, b) => a.order - b.order);
const message = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback);

/**
 * Projects data + CRUD, backed by TanStack Query (caching, dedup, retries,
 * cancellation, real error surfacing). The public API is unchanged so consumers
 * don't need updates.
 */
export function useProjects(): UseProjectsReturn {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.projects });

  const query = useQuery({
    queryKey: queryKeys.projects,
    queryFn: async () => sortByOrder(await ninsysAPI.getProjects()),
  });

  const createMut = useMutation({
    mutationFn: (input: CreateProjectInput) => ninsysAPI.createProject(input),
    onSuccess: invalidate,
  });
  const updateMut = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProjectInput }) =>
      ninsysAPI.updateProject(id, input),
    onSuccess: invalidate,
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => ninsysAPI.deleteProject(id),
    onSuccess: invalidate,
  });
  const reorderMut = useMutation({
    mutationFn: (projectIds: string[]) => ninsysAPI.reorderProjects(projectIds),
    onSettled: invalidate,
  });

  const err =
    query.error ?? createMut.error ?? updateMut.error ?? deleteMut.error ?? reorderMut.error;

  return {
    projects: query.data ?? [],
    loading: query.isLoading,
    error: err ? message(err, "Something went wrong with projects") : null,
    refresh: async () => {
      await query.refetch();
    },
    createProject: async (input) => {
      try {
        return await createMut.mutateAsync(input);
      } catch {
        return null;
      }
    },
    updateProject: async (id, input) => {
      try {
        return await updateMut.mutateAsync({ id, input });
      } catch {
        return null;
      }
    },
    deleteProject: async (id) => {
      try {
        await deleteMut.mutateAsync(id);
        return true;
      } catch {
        return false;
      }
    },
    reorderProjects: async (projectIds) => {
      try {
        await reorderMut.mutateAsync(projectIds);
        return true;
      } catch {
        return false;
      }
    },
    setLocalProjects: (projects) => {
      qc.setQueryData(queryKeys.projects, projects);
    },
  };
}
