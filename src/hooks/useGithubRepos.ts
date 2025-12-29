import { useCallback, useEffect, useState } from 'react';
import { GitHubRepo, Project } from '../types/projects';
import { safeFetch } from '../utils/apiHelpers';
import { ninsysAPI } from '../utils/ninsysAPI';

/**
 * Return type for the useGitHubRepos hook
 * @property repos - Array of GitHub repositories from the authenticated user
 * @property loading - True while fetching repos from GitHub API
 * @property error - Error message from the most recent failed operation, or null
 * @property refresh - Refetch repositories from GitHub
 * @property importRepo - Import a GitHub repo as a project (creates project via API)
 * @property importing - Name of the repo currently being imported, or null
 */
interface UseGitHubReposReturn {
  repos: GitHubRepo[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  importRepo: (repoName: string) => Promise<Project | null>;
  importing: string | null;
}

/**
 * Hook for fetching GitHub repositories and importing them as projects.
 * Fetches repos on mount (sorted by most recently pushed, up to 50).
 * The importRepo function creates a new project from the GitHub repo data.
 *
 * @example
 * const { repos, loading, importRepo } = useGitHubRepos();
 * const project = await importRepo('my-repo-name');
 */
export function useGitHubRepos(): UseGitHubReposReturn {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState<string | null>(null);

  const fetchRepos = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await safeFetch(
      () => ninsysAPI.getGitHubRepos({ perPage: 50, sort: 'pushed' }),
      [] as GitHubRepo[]
    );

    setRepos(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  const importRepo = useCallback(async (repoName: string): Promise<Project | null> => {
    try {
      setImporting(repoName);
      setError(null);
      const project = await ninsysAPI.importGitHubRepo(repoName);
      return project;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import repository');
      return null;
    } finally {
      setImporting(null);
    }
  }, []);

  return {
    repos,
    loading,
    error,
    refresh: fetchRepos,
    importRepo,
    importing,
  };
}
