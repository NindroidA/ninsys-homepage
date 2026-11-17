/**
 * Site-wide configuration controlled from the admin panel and stored by
 * ninsys-api (`GET`/`PUT /v2/config`). Until admin saves one, the homepage
 * uses DEFAULT_SITE_CONFIG.
 */

import { type HostedProject, hostedProjects } from "../assets/hostedProjects";

export type { HostedStatus } from "../assets/hostedProjects";

export type HomeSectionId = "status" | "hosted" | "nav";

export interface HomeSection {
  id: HomeSectionId;
  /** Human label shown in the admin. Comes from the defaults, never from storage. */
  label: string;
  visible: boolean;
}

/** One Hosted shelf card, as admin edits it and the API stores it. */
export interface HostedEntry extends HostedProject {
  visible: boolean;
}

export interface SiteConfig {
  /** Ordered homepage sections. The hero and footer are fixed and not listed here. */
  sections: HomeSection[];
  /** The Hosted shelf cards, in display order. */
  hosted: HostedEntry[];
}

/** What `/v2/config` carries: section labels stay in code. */
export interface SiteConfigWire {
  sections: { id: HomeSectionId; visible: boolean }[];
  hosted: HostedEntry[];
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  sections: [
    { id: "status", label: "System Status", visible: true },
    { id: "hosted", label: "Hosted projects", visible: true },
    { id: "nav", label: "Explore (quick access)", visible: true },
  ],
  hosted: hostedProjects.map((p) => ({ ...p, visible: true })),
};
