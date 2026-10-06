/**
 * Pure helpers for the site config: turning whatever storage or the API hands
 * us into a usable config, the wire format for `/v2/config`, and the Hosted
 * entry form's validation. No React and no fetches, so they're unit-tested.
 */

import {
  DEFAULT_SITE_CONFIG,
  type HomeSection,
  type HostedEntry,
  type HostedStatus,
  type SiteConfig,
  type SiteConfigWire,
} from "../types/siteConfig";

/** The same limits ninsys-api enforces on `PUT /v2/config`. */
export const HOSTED_LIMITS = {
  entries: 50,
  name: 100,
  description: 300,
  url: 500,
  tags: 6,
  tag: 30,
} as const;

const ID_RE = /^[a-z0-9-]{1,64}$/;
const ICON_RE = /^[a-z0-9-]{1,40}$/;
const FALLBACK_ICON = "server";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * `value` if it's an absolute http(s) URL, otherwise undefined. These become
 * links on the public homepage, so `javascript:`, `data:` and relative URLs
 * never get through.
 */
export function safeUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > HOSTED_LIMITS.url) return undefined;
  try {
    const { protocol } = new URL(trimmed);
    return protocol === "http:" || protocol === "https:" ? trimmed : undefined;
  } catch {
    return undefined;
  }
}

function cleanTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((t): t is string => typeof t === "string")
    .map((t) => t.trim().slice(0, HOSTED_LIMITS.tag))
    .filter(Boolean)
    .slice(0, HOSTED_LIMITS.tags);
}

/**
 * One stored Hosted entry, cleaned up, or null when it can't be shown. Configs
 * from before the shelf was editable stored only `{ id, visible }` over the
 * built-in entries; those expand from the built-in entry with that id.
 */
function hostedEntry(raw: unknown, builtIn: Map<string, HostedEntry>): HostedEntry | null {
  if (!isRecord(raw) || typeof raw.id !== "string" || !ID_RE.test(raw.id)) return null;
  const visible = raw.visible !== false;

  if (typeof raw.name !== "string") {
    const def = builtIn.get(raw.id);
    return def ? { ...def, visible } : null;
  }

  const name = raw.name.trim().slice(0, HOSTED_LIMITS.name);
  const status: HostedStatus | null =
    raw.status === "live" || raw.status === "building" ? raw.status : null;
  if (!name || !status) return null;

  const url = safeUrl(raw.url);
  const repoUrl = safeUrl(raw.repoUrl);
  const stack = cleanTags(raw.stack);
  return {
    id: raw.id,
    name,
    description:
      typeof raw.description === "string"
        ? raw.description.trim().slice(0, HOSTED_LIMITS.description)
        : "",
    status,
    ...(url ? { url } : {}),
    ...(repoUrl ? { repoUrl } : {}),
    icon: typeof raw.icon === "string" && ICON_RE.test(raw.icon) ? raw.icon : FALLBACK_ICON,
    ...(stack.length > 0 ? { stack } : {}),
    visible,
  };
}

/**
 * Turn a stored or fetched config (possibly from an older build, possibly
 * garbage) into a usable one.
 * - Sections: keep the stored order and visibility for known ids, drop unknown
 *   and repeated ids, append sections added since, and take labels from the
 *   defaults.
 * - Hosted: keep the stored entries as they are, so entries admin deleted stay
 *   deleted. A missing list means the built-in entries. An old `{ id, visible }`
 *   list gets the built-in entries it didn't know about appended, as before.
 */
export function reconcile(raw: unknown): SiteConfig {
  const partial = isRecord(raw) ? raw : {};

  const known = DEFAULT_SITE_CONFIG.sections;
  const storedSections = Array.isArray(partial.sections) ? partial.sections : [];
  const sections: HomeSection[] = [];
  for (const s of storedSections) {
    const def = isRecord(s) ? known.find((k) => k.id === s.id) : undefined;
    if (def && !sections.some((o) => o.id === def.id)) {
      sections.push({
        id: def.id,
        label: def.label,
        visible: (s as { visible?: unknown }).visible !== false,
      });
    }
  }
  for (const def of known) {
    if (!sections.some((o) => o.id === def.id)) sections.push({ ...def });
  }

  const builtIn = new Map(DEFAULT_SITE_CONFIG.hosted.map((h) => [h.id, h]));
  if (!Array.isArray(partial.hosted)) {
    return { sections, hosted: DEFAULT_SITE_CONFIG.hosted.map((h) => ({ ...h })) };
  }

  const hosted: HostedEntry[] = [];
  let legacy = partial.hosted.length > 0;
  for (const item of partial.hosted) {
    if (isRecord(item) && typeof item.name === "string") legacy = false;
    const entry = hostedEntry(item, builtIn);
    if (entry && !hosted.some((h) => h.id === entry.id)) hosted.push(entry);
  }
  if (legacy) {
    for (const def of builtIn.values()) {
      if (!hosted.some((h) => h.id === def.id)) hosted.push({ ...def });
    }
  }

  return { sections, hosted: hosted.slice(0, HOSTED_LIMITS.entries) };
}

/** The body for `PUT /v2/config`. */
export function toWire(config: SiteConfig): SiteConfigWire {
  return {
    sections: config.sections.map(({ id, visible }) => ({ id, visible })),
    hosted: config.hosted.map((h) => ({ ...h })),
  };
}
