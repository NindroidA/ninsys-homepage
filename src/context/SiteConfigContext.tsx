import { createContext, type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_SITE_CONFIG,
  type HomeSection,
  type HomeSectionId,
  type HostedOverride,
  type SiteConfig,
} from "../types/siteConfig";

const STORAGE_KEY = "ninsys_site_config";

export interface SiteConfigValue {
  config: SiteConfig;
  toggleSection: (id: HomeSectionId) => void;
  moveSection: (id: HomeSectionId, direction: -1 | 1) => void;
  toggleHosted: (id: string) => void;
  moveHosted: (id: string, direction: -1 | 1) => void;
  setEnable3DRack: (value: boolean) => void;
  reset: () => void;
}

export const SiteConfigContext = createContext<SiteConfigValue | null>(null);

/**
 * Reconcile a stored (possibly stale) config against the current defaults:
 * keep the stored section order + visibility for known ids, drop unknown ids,
 * append any newly-added default sections, and backfill missing scalar fields.
 */
function reconcile(raw: unknown): SiteConfig {
  const partial = (raw ?? {}) as Partial<SiteConfig>;
  const known = DEFAULT_SITE_CONFIG.sections;
  const stored = Array.isArray(partial.sections) ? partial.sections : [];

  const ordered: HomeSection[] = [];
  for (const s of stored) {
    const def = known.find((k) => k.id === s?.id);
    if (def && !ordered.some((o) => o.id === def.id)) {
      ordered.push({
        id: def.id,
        label: def.label,
        visible: s.visible !== false,
      });
    }
  }
  for (const def of known) {
    if (!ordered.some((o) => o.id === def.id)) ordered.push({ ...def });
  }

  const knownHosted = DEFAULT_SITE_CONFIG.hosted;
  const storedHosted = Array.isArray(partial.hosted) ? partial.hosted : [];
  const hosted: HostedOverride[] = [];
  for (const h of storedHosted) {
    const def = knownHosted.find((k) => k.id === h?.id);
    if (def && !hosted.some((o) => o.id === def.id)) {
      hosted.push({ id: def.id, visible: h.visible !== false });
    }
  }
  for (const def of knownHosted) {
    if (!hosted.some((o) => o.id === def.id)) hosted.push({ ...def });
  }

  return {
    sections: ordered,
    enable3DRack:
      typeof partial.enable3DRack === "boolean"
        ? partial.enable3DRack
        : DEFAULT_SITE_CONFIG.enable3DRack,
    hosted,
  };
}

function loadConfig(): SiteConfig {
  if (typeof window === "undefined") return DEFAULT_SITE_CONFIG;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? reconcile(JSON.parse(raw)) : DEFAULT_SITE_CONFIG;
  } catch {
    return DEFAULT_SITE_CONFIG;
  }
}

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(loadConfig);

  // Persist to localStorage. (Swap this for a PUT /v2/config when the API lands.)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // ignore quota / privacy-mode failures
    }
  }, [config]);

  const toggleSection = useCallback((id: HomeSectionId) => {
    setConfig((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)),
    }));
  }, []);

  const moveSection = useCallback((id: HomeSectionId, direction: -1 | 1) => {
    setConfig((prev) => {
      const index = prev.sections.findIndex((s) => s.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= prev.sections.length) return prev;
      const sections = [...prev.sections];
      const [moved] = sections.splice(index, 1);
      if (moved) sections.splice(target, 0, moved);
      return { ...prev, sections };
    });
  }, []);

  const toggleHosted = useCallback((id: string) => {
    setConfig((prev) => ({
      ...prev,
      hosted: prev.hosted.map((h) => (h.id === id ? { ...h, visible: !h.visible } : h)),
    }));
  }, []);

  const moveHosted = useCallback((id: string, direction: -1 | 1) => {
    setConfig((prev) => {
      const index = prev.hosted.findIndex((h) => h.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= prev.hosted.length) return prev;
      const hosted = [...prev.hosted];
      const [moved] = hosted.splice(index, 1);
      if (moved) hosted.splice(target, 0, moved);
      return { ...prev, hosted };
    });
  }, []);

  const setEnable3DRack = useCallback((value: boolean) => {
    setConfig((prev) => ({ ...prev, enable3DRack: value }));
  }, []);

  const reset = useCallback(() => setConfig(DEFAULT_SITE_CONFIG), []);

  const value = useMemo<SiteConfigValue>(
    () => ({
      config,
      toggleSection,
      moveSection,
      toggleHosted,
      moveHosted,
      setEnable3DRack,
      reset,
    }),
    [config, toggleSection, moveSection, toggleHosted, moveHosted, setEnable3DRack, reset],
  );

  return <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>;
}
