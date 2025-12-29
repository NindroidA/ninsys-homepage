import { useCallback, useEffect, useState } from 'react';
import { AboutData, AboutProfile, AboutSection, DEFAULT_ABOUT_DATA } from '../types/about';
import { safeFetch } from '../utils/apiHelpers';
import { ninsysAPI } from '../utils/ninsysAPI';

interface UseAboutDataReturn {
  data: AboutData;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateProfile: (profile: Partial<AboutProfile>) => Promise<boolean>;
  updateSections: (sections: AboutSection[]) => Promise<boolean>;
  updateFullData: (data: Partial<AboutData>) => Promise<boolean>;
  // Optimistic update for drag-and-drop
  setLocalSections: (sections: AboutSection[]) => void;
}

export function useAboutData(): UseAboutDataReturn {
  const [data, setData] = useState<AboutData>(DEFAULT_ABOUT_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await safeFetch(
      () => ninsysAPI.getAboutData(),
      DEFAULT_ABOUT_DATA
    );

    // Sort sections by order
    const sortedData = {
      ...result,
      sections: [...result.sections].sort((a, b) => a.order - b.order),
    };

    setData(sortedData);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateProfile = useCallback(async (profile: Partial<AboutProfile>): Promise<boolean> => {
    try {
      setError(null);
      const updatedData = await ninsysAPI.updateAboutData({
        profile: { ...data.profile, ...profile },
      });
      setData({
        ...updatedData,
        sections: [...updatedData.sections].sort((a, b) => a.order - b.order),
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      return false;
    }
  }, [data.profile]);

  const updateSections = useCallback(async (sections: AboutSection[]): Promise<boolean> => {
    try {
      setError(null);
      const updatedData = await ninsysAPI.updateAboutData({ sections });
      setData({
        ...updatedData,
        sections: [...updatedData.sections].sort((a, b) => a.order - b.order),
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update sections');
      // Refresh to revert optimistic update
      await fetchData();
      return false;
    }
  }, [fetchData]);

  const updateFullData = useCallback(async (newData: Partial<AboutData>): Promise<boolean> => {
    try {
      setError(null);
      const updatedData = await ninsysAPI.updateAboutData(newData);
      setData({
        ...updatedData,
        sections: [...updatedData.sections].sort((a, b) => a.order - b.order),
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update data');
      return false;
    }
  }, []);

  const setLocalSections = useCallback((sections: AboutSection[]) => {
    setData((prev) => ({ ...prev, sections }));
  }, []);

  return {
    data,
    loading,
    error,
    refresh: fetchData,
    updateProfile,
    updateSections,
    updateFullData,
    setLocalSections,
  };
}
