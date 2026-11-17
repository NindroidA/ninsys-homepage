import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryClient";
import { ninsysAPI } from "../utils/ninsysAPI";

interface LiveService {
  id: string;
  name: string;
  description: string;
  status: "online" | "degraded" | "offline" | "loading" | "coming_soon";
  uptime?: string;
  stats?: {
    guilds?: number;
    users?: number;
    devices?: number;
  };
  lastUpdated?: string;
  category?: string;
  icon?: string;
}

export const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

/**
 * The API's status from the `status` its `/health` reports. ninsys-api answers `degraded`
 * (still HTTP 200) when it is up but its own database isn't, so that gets its own state
 * instead of reading as down. Anything else, or no answer at all, is offline.
 */
export const statusFromHealth = (health: unknown): "online" | "degraded" | "offline" => {
  if (health === "healthy") return "online";
  if (health === "degraded") return "degraded";
  return "offline";
};

// Single source of truth for the service registry (statuses are filled in live).
const BASE_SERVICES: LiveService[] = [
  {
    id: "api",
    name: "Nindroid Systems API",
    description: "Backend API for Nindroid Systems",
    category: "System Backend",
    icon: "activity",
    status: "loading",
  },
  {
    id: "cogworks",
    name: "Cogworks Bot",
    description: "Multi-functional Discord Bot",
    category: "Discord Integration",
    icon: "cog",
    status: "loading",
  },
  {
    id: "cogworks-web",
    name: "Cogworks Dashboard",
    description: "Web dashboard for Cogworks Bot management",
    category: "Web Application",
    icon: "globe",
    status: "online",
  },
  {
    id: "pluginator",
    name: "Pluginator",
    description: "Web app for Minecraft server plugin management",
    category: "Developer Tools",
    icon: "zap",
    status: "online",
  },
];

export async function fetchServices(): Promise<LiveService[]> {
  const [cogworksStatus, systemHealth] = await Promise.allSettled([
    ninsysAPI.getCogworksStatus(),
    ninsysAPI.getSystemHealth(),
  ]);
  const now = new Date().toISOString();

  return BASE_SERVICES.map((svc) => {
    if (svc.id === "api") {
      return {
        ...svc,
        status: statusFromHealth(
          systemHealth.status === "fulfilled" ? systemHealth.value?.data?.status : undefined,
        ),
        lastUpdated: now,
      };
    }
    if (svc.id === "cogworks") {
      const online = cogworksStatus.status === "fulfilled" && cogworksStatus.value.online;
      return {
        ...svc,
        status: online ? "online" : "offline",
        uptime:
          cogworksStatus.status === "fulfilled"
            ? formatUptime(cogworksStatus.value.uptime)
            : undefined,
        lastUpdated: now,
      };
    }
    return svc; // statically-statused entries (dashboard, pluginator) pass through
  });
}

/**
 * Live service status, backed by TanStack Query with a 60s refetch interval
 * (replaces the manual setInterval). Public API unchanged.
 */
export const useLiveServices = () => {
  const query = useQuery({
    queryKey: queryKeys.liveServices,
    queryFn: fetchServices,
    refetchInterval: 60_000,
    placeholderData: BASE_SERVICES,
  });

  return {
    services: query.data ?? BASE_SERVICES,
    loading: query.isLoading,
    error: query.error
      ? query.error instanceof Error
        ? query.error.message
        : "Failed to fetch service data"
      : null,
    refresh: async () => {
      await query.refetch();
    },
  };
};
