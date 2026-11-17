import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { queryKeys } from "../lib/queryClient";
import { reconcile, toWire } from "../lib/siteConfig";
import {
  DEFAULT_SITE_CONFIG,
  type HomeSectionId,
  type HostedEntry,
  type SiteConfig,
} from "../types/siteConfig";
import { ninsysAPI } from "../utils/ninsysAPI";

/** The last config the API returned, so a returning visitor's first paint has the right layout. */
const CACHE_KEY = "ninsys_site_config_v2";
/** Where builds before the config API kept admin's settings, per browser. Used until the API has a config. */
const LEGACY_KEY = "ninsys_site_config";
/** How long the homepage waits for the API before it shows the fallback layout. */
const READY_TIMEOUT_MS = 1500;

export type SaveState =
  | { status: "idle" }
  | { status: "saving" }
  | { status: "saved" }
  | { status: "error"; error: string };

export interface SiteConfigValue {
  config: SiteConfig;
  /**
   * False until the API answers, a cached copy exists, or READY_TIMEOUT_MS
   * passes. The homepage waits for it so it never renders a layout it is about
   * to change.
   */
  ready: boolean;
  /** Whether the API holds a saved config: null while that's unknown (loading, or unreachable). */
  stored: boolean | null;
  /** Why the config couldn't be loaded, when the API is unreachable and nothing has loaded. */
  loadError: string | null;
  saveState: SaveState;
  retrySave: () => void;
  toggleSection: (id: HomeSectionId) => void;
  moveSection: (id: HomeSectionId, direction: -1 | 1) => void;
  resetSections: () => void;
  toggleHosted: (id: string) => void;
  moveHosted: (id: string, direction: -1 | 1) => void;
  /** Add an entry, or replace the one with the same id. Rejects with the API's error. */
  saveHosted: (entry: HostedEntry) => Promise<void>;
  removeHosted: (id: string) => Promise<void>;
  /** Sections and the Hosted shelf back to the built-in defaults. */
  reset: () => void;
}

export const SiteConfigContext = createContext<SiteConfigValue | null>(null);

function readStored(key: string): SiteConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? reconcile(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function writeCache(config: SiteConfig | null): void {
  try {
    if (config) {
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(toWire(config)));
      // The API holds it now, so the per-browser copy from older builds is obsolete.
      window.localStorage.removeItem(LEGACY_KEY);
    } else {
      window.localStorage.removeItem(CACHE_KEY);
    }
  } catch {
    // ignore quota / privacy-mode failures
  }
}

async function fetchSiteConfig(): Promise<SiteConfig | null> {
  const raw = await ninsysAPI.getSiteConfig();
  const config = raw === null ? null : reconcile(raw);
  writeCache(config);
  return config;
}

function move<T extends { id: string }>(list: T[], id: string, direction: -1 | 1): T[] {
  const index = list.findIndex((item) => item.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= list.length) return list;
  const next = [...list];
  const [moved] = next.splice(index, 1);
  if (moved) next.splice(target, 0, moved);
  return next;
}

const errorMessage = (err: unknown) =>
  err instanceof Error ? err.message : "Couldn't reach the site config API";

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [cached] = useState(() => readStored(CACHE_KEY));
  const [fallback] = useState(() => readStored(LEGACY_KEY) ?? DEFAULT_SITE_CONFIG);
  const [timedOut, setTimedOut] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" });

  const query = useQuery({
    queryKey: queryKeys.siteConfig,
    queryFn: fetchSiteConfig,
    staleTime: 60_000,
    // The homepage waits on this; a failure falls back at once and the next visit tries again.
    retry: false,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setTimedOut(true), READY_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, []);

  // The API's copy once it answers (the fallback if it has none). Until then,
  // or when it's unreachable, the cached copy, then the fallback.
  const config = query.data !== undefined ? (query.data ?? fallback) : (cached ?? fallback);
  const ready = query.isFetched || cached !== null || timedOut;
  const stored = query.data === undefined ? null : query.data !== null;
  const loadError = query.isError && query.data === undefined ? errorMessage(query.error) : null;

  // Actions build on the newest config, including saves still in flight.
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  });
  const current = useCallback(
    (): SiteConfig => qc.getQueryData<SiteConfig | null>(queryKeys.siteConfig) ?? configRef.current,
    [qc],
  );

  // Saves run one at a time, each sending the whole config, so the last click wins
  // even if an earlier request is slow. Only the newest save settles the state.
  const chain = useRef<Promise<unknown>>(Promise.resolve());
  const lastAttempt = useRef<SiteConfig | null>(null);

  const save = useCallback(
    async (next: SiteConfig): Promise<void> => {
      lastAttempt.current = next;
      await qc.cancelQueries({ queryKey: queryKeys.siteConfig });
      qc.setQueryData(queryKeys.siteConfig, next);
      setSaveState({ status: "saving" });
      const run = chain.current
        .catch(() => undefined)
        .then(() => ninsysAPI.updateSiteConfig(toWire(next)));
      chain.current = run;
      try {
        const saved = reconcile(await run);
        if (chain.current === run) {
          qc.setQueryData(queryKeys.siteConfig, saved);
          writeCache(saved);
          setSaveState({ status: "saved" });
        }
      } catch (err) {
        if (chain.current === run) setSaveState({ status: "error", error: errorMessage(err) });
        throw err;
      }
    },
    [qc],
  );

  // For one-click actions: a failure shows up in saveState, with a retry.
  const apply = useCallback(
    (change: (prev: SiteConfig) => SiteConfig) => {
      save(change(current())).catch(() => undefined);
    },
    [save, current],
  );

  const retrySave = useCallback(() => {
    if (lastAttempt.current) save(lastAttempt.current).catch(() => undefined);
  }, [save]);

  const toggleSection = useCallback(
    (id: HomeSectionId) =>
      apply((prev) => ({
        ...prev,
        sections: prev.sections.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)),
      })),
    [apply],
  );

  const moveSection = useCallback(
    (id: HomeSectionId, direction: -1 | 1) =>
      apply((prev) => ({ ...prev, sections: move(prev.sections, id, direction) })),
    [apply],
  );

  const resetSections = useCallback(
    () => apply((prev) => ({ ...prev, sections: reconcile(null).sections })),
    [apply],
  );

  const toggleHosted = useCallback(
    (id: string) =>
      apply((prev) => ({
        ...prev,
        hosted: prev.hosted.map((h) => (h.id === id ? { ...h, visible: !h.visible } : h)),
      })),
    [apply],
  );

  const moveHosted = useCallback(
    (id: string, direction: -1 | 1) =>
      apply((prev) => ({ ...prev, hosted: move(prev.hosted, id, direction) })),
    [apply],
  );

  const saveHosted = useCallback(
    (entry: HostedEntry) => {
      const prev = current();
      const exists = prev.hosted.some((h) => h.id === entry.id);
      return save({
        ...prev,
        hosted: exists
          ? prev.hosted.map((h) => (h.id === entry.id ? entry : h))
          : [...prev.hosted, entry],
      });
    },
    [save, current],
  );

  const removeHosted = useCallback(
    (id: string) => {
      const prev = current();
      return save({ ...prev, hosted: prev.hosted.filter((h) => h.id !== id) });
    },
    [save, current],
  );

  // reconcile(null) is a fresh copy of the defaults.
  const reset = useCallback(() => apply(() => reconcile(null)), [apply]);

  const value = useMemo<SiteConfigValue>(
    () => ({
      config,
      ready,
      stored,
      loadError,
      saveState,
      retrySave,
      toggleSection,
      moveSection,
      resetSections,
      toggleHosted,
      moveHosted,
      saveHosted,
      removeHosted,
      reset,
    }),
    [
      config,
      ready,
      stored,
      loadError,
      saveState,
      retrySave,
      toggleSection,
      moveSection,
      resetSections,
      toggleHosted,
      moveHosted,
      saveHosted,
      removeHosted,
      reset,
    ],
  );

  return <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>;
}
