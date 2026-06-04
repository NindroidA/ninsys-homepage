import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryClient";
import { ninsysAPI } from "../utils/ninsysAPI";

interface LiveService {
  id: string;
  name: string;
  description: string;
  status: "online" | "offline" | "loading" | "coming_soon";
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

const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
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
    name: "Cogworks",
    description: "Web dashboard for Cogworks Bot management",
    category: "Web Application",
    icon: "globe",
    status: "coming_soon",
  },
  {
    id: "pluginator",
    name: "Pluginator",
    description: "Plugin management and automation platform",
    category: "Developer Tools",
    icon: "zap",
    status: "coming_soon",
  },
];

async function fetchServices(): Promise<LiveService[]> {
  const [cogworksStatus, systemHealth] = await Promise.allSettled([
    ninsysAPI.getCogworksStatus(),
    ninsysAPI.getSystemHealth(),
  ]);
  const now = new Date().toISOString();

  return BASE_SERVICES.map((svc) => {
    if (svc.id === "api") {
      const healthy =
        systemHealth.status === "fulfilled" && systemHealth.value.data?.status === "healthy";
      return { ...svc, status: healthy ? "online" : "offline", lastUpdated: now };
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
    return svc; // coming_soon entries unchanged
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
