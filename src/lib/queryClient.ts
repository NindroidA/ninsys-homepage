import { QueryClient } from "@tanstack/react-query";

/**
 * Single shared query client. Sensible defaults for a content site: short
 * staleness, no refetch-on-focus thrash, a couple of retries for transient blips.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export const queryKeys = {
  projects: ["projects"] as const,
  about: ["about"] as const,
  githubRepos: ["github-repos"] as const,
  liveServices: ["live-services"] as const,
};
