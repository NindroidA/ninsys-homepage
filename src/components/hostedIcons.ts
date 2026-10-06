import {
  Blocks,
  Bot,
  Boxes,
  Cloud,
  CodeXml,
  Cpu,
  Database,
  Gamepad2,
  Globe,
  HardDrive,
  LayoutDashboard,
  type LucideIcon,
  Music,
  Network,
  Printer,
  Radio,
  Server,
  Shield,
  Terminal,
  Wrench,
} from "lucide-react";

/**
 * The icons a Hosted shelf card can use, by the key stored in its `icon`.
 * Admin offers exactly these; an unknown key falls back to `server`.
 */
export const HOSTED_ICONS: Record<string, LucideIcon> = {
  server: Server,
  globe: Globe,
  dashboard: LayoutDashboard,
  bot: Bot,
  blocks: Blocks,
  boxes: Boxes,
  network: Network,
  shield: Shield,
  cloud: Cloud,
  code: CodeXml,
  terminal: Terminal,
  database: Database,
  drive: HardDrive,
  cpu: Cpu,
  radio: Radio,
  printer: Printer,
  music: Music,
  gamepad: Gamepad2,
  wrench: Wrench,
};

export function hostedIcon(key: string): LucideIcon {
  return HOSTED_ICONS[key] ?? Server;
}
