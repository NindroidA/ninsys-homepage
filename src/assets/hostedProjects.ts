/**
 * The "Hosted" shelf on the homepage — the self-hosted projects that actually run
 * on the homelab, plus the ones currently in the works.
 *
 * Adding a project is a one-object edit:
 *   - `status: "live"`     → shows a green "live" pill and links to `url` + `repoUrl`.
 *   - `status: "building"` → shows a "building" pill; no live link needed (omit `url`).
 *
 * `icon` is a key in the iconMap inside HostedShelf.tsx — add the lucide icon there
 * if you use a new one. Keep `stack` to ~3 short tags.
 *
 * (A future /admin control panel will manage this list in-app; for now it's static.)
 */

export type HostedStatus = "live" | "building";

export interface HostedProject {
  id: string;
  name: string;
  description: string;
  status: HostedStatus;
  /** Live site — for `status: "live"`. Omit for projects still in the works. */
  url?: string;
  /** Public GitHub repo. Omit for private repos so the link isn't a 404. */
  repoUrl?: string;
  /** Key in HostedShelf's iconMap. */
  icon: string;
  /** Up to ~3 short stack tags. */
  stack?: string[];
}

export const hostedProjects: HostedProject[] = [
  {
    id: "pluginator",
    name: "Pluginator",
    description:
      "Minecraft server plugin manager with multi-source update checking and downloading.",
    status: "live",
    url: "https://pluginator.nindroidsystems.com",
    repoUrl: "https://github.com/NindroidA/pluginator",
    icon: "blocks",
    stack: ["TypeScript", "Bun", "CLI"],
  },
  {
    id: "cogworks",
    name: "Cogworks",
    description:
      "Modular Discord server management bot — tickets, applications, reaction roles, and more — with a web dashboard.",
    status: "live",
    url: "https://cogworks.nindroidsystems.com",
    repoUrl: "https://github.com/NindroidA/cogworks-bot",
    icon: "bot",
    stack: ["TypeScript", "Discord.js", "Bun"],
  },
  {
    id: "respool",
    name: "Respool",
    description: "3D-printing filament management — track spools, log usage, plan swaps.",
    status: "live",
    url: "https://respool.nindroidsystems.com",
    repoUrl: "https://github.com/NindroidA/respool",
    icon: "boxes",
    stack: ["Next.js", "Postgres", "Prisma"],
  },
  {
    id: "ninsys-api",
    name: "Nindroid Systems API",
    description: "The backend that powers every Nindroid Systems project and this site.",
    status: "live",
    url: "https://api.nindroidsystems.com",
    icon: "server",
    stack: ["TypeScript", "Bun", "API"],
  },
  {
    id: "ninsys-homepage",
    name: "nindroidsystems.com",
    description: "This site — the homepage and front door for everything above.",
    status: "live",
    url: "https://nindroidsystems.com",
    repoUrl: "https://github.com/NindroidA/ninsys-homepage",
    icon: "globe",
    stack: ["React", "Vite", "Tailwind"],
  },
  // ── In the works ──────────────────────────────────────────────────────────
  // Guessed from recent GitHub activity — swap/remove freely.
  {
    id: "racksmith",
    name: "Racksmith",
    description:
      "Network admin utility — rack visualization, IPAM, VLANs, topology, and auto-discovery.",
    status: "building",
    repoUrl: "https://github.com/NindroidA/racksmith",
    icon: "network",
    stack: ["TypeScript", "IPAM", "Topology"],
  },
  {
    id: "urltriage",
    name: "URLTriage",
    description:
      "SOC analyst's URL triage CLI — fans out across urlscan, VirusTotal, URLhaus, and WHOIS for one reasoned verdict.",
    status: "building",
    icon: "shield",
    stack: ["Go", "CLI", "SOC"],
  },
];
