/**
 * Site-wide configuration controlled from the admin panel. Currently persisted
 * client-side (localStorage); the shape is intentionally API-ready so it can move
 * to `GET/PUT /v2/config` later with no consumer changes.
 */

export type HomeSectionId = "status" | "hosted" | "nav";

export interface HomeSection {
  id: HomeSectionId;
  /** Human label shown in the admin. */
  label: string;
  visible: boolean;
}

export interface SiteConfig {
  /** Ordered homepage sections. The hero and footer are fixed and not listed here. */
  sections: HomeSection[];
  /** Attempt the WebGL 3D rack on capable devices; false = always the 2D poster. */
  enable3DRack: boolean;
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  sections: [
    { id: "status", label: "System Status", visible: true },
    { id: "hosted", label: "Hosted projects", visible: true },
    { id: "nav", label: "Explore (quick access)", visible: true },
  ],
  enable3DRack: true,
};
