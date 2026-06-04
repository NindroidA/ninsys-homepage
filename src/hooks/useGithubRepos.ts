import { useMutation, useQuery } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryClient";
import type { GitHubRepo, Project } from "../types/projects";
import { ninsysAPI } from "../utils/ninsysAPI";

interface UseGitHubReposReturn {
  repos: GitHubRepo[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  importRepo: (repoName: string) => Promise<Project | null>;
  /** Name of the repo currently being imported, or null. */
  importing: string | null;
}

const message = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback);

/**
 * Fetch GitHub repos (cached) and import one as a project. Backed by TanStack
 * Query so repos aren't re-fetched on every Projects-page mount. Public API
 * unchanged.
 */
export function useGitHubRepos(): UseGitHubReposReturn {
  const query = useQuery({
    queryKey: queryKeys.githubRepos,
    queryFn: () => ninsysAPI.getGitHubRepos({ perPage: 50, sort: "pushed" }),
    staleTime: 5 * 60_000,
  });

  const importMut = useMutation({
    mutationFn: (repoName: string) => ninsysAPI.importGitHubRepo(repoName),
  });

  const err = query.error ?? importMut.error;

  return {
    repos: query.data ?? [],
    loading: query.isLoading,
    error: err ? message(err, "GitHub request failed") : null,
    refresh: async () => {
      await query.refetch();
    },
    importRepo: async (repoName) => {
      try {
        return await importMut.mutateAsync(repoName);
      } catch {
        return null;
      }
    },
    importing: importMut.isPending ? (importMut.variables ?? null) : null,
  };
}
