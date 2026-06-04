import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryClient";
import {
  type AboutData,
  type AboutProfile,
  type AboutSection,
  DEFAULT_ABOUT_DATA,
} from "../types/about";
import { ninsysAPI } from "../utils/ninsysAPI";

interface UseAboutDataReturn {
  data: AboutData;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateProfile: (profile: Partial<AboutProfile>) => Promise<boolean>;
  updateSections: (sections: AboutSection[]) => Promise<boolean>;
  updateFullData: (data: Partial<AboutData>) => Promise<boolean>;
  /** Optimistic local update for drag-and-drop section reordering. */
  setLocalSections: (sections: AboutSection[]) => void;
}

const sortSections = (data: AboutData): AboutData => ({
  ...data,
  sections: [...data.sections].sort((a, b) => a.order - b.order),
});
const message = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback);

/**
 * About-page data + mutations, backed by TanStack Query. Public API unchanged.
 */
export function useAboutData(): UseAboutDataReturn {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.about,
    queryFn: async () => sortSections(await ninsysAPI.getAboutData()),
  });
  const data = query.data ?? DEFAULT_ABOUT_DATA;

  const updateMut = useMutation({
    mutationFn: (payload: Partial<AboutData>) => ninsysAPI.updateAboutData(payload),
    onSuccess: (updated) => qc.setQueryData(queryKeys.about, sortSections(updated)),
    onError: () => qc.invalidateQueries({ queryKey: queryKeys.about }),
  });

  const err = query.error ?? updateMut.error;

  return {
    data,
    loading: query.isLoading,
    error: err ? message(err, "Something went wrong with the about page") : null,
    refresh: async () => {
      await query.refetch();
    },
    updateProfile: async (profile) => {
      try {
        await updateMut.mutateAsync({ profile: { ...data.profile, ...profile } });
        return true;
      } catch {
        return false;
      }
    },
    updateSections: async (sections) => {
      try {
        await updateMut.mutateAsync({ sections });
        return true;
      } catch {
        return false;
      }
    },
    updateFullData: async (newData) => {
      try {
        await updateMut.mutateAsync(newData);
        return true;
      } catch {
        return false;
      }
    },
    setLocalSections: (sections) => {
      qc.setQueryData<AboutData>(queryKeys.about, (prev) => ({
        ...(prev ?? DEFAULT_ABOUT_DATA),
        sections,
      }));
    },
  };
}
