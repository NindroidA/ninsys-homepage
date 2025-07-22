// assets/services.ts
export type ServiceStatusType = 'online' | 'offline' | 'pending' | 'maintenance';

export interface StatusCheckConfig {
  enabled: boolean;
  endpoint?: string;
  interval?: number; // in milliseconds
  method?: 'GET' | 'POST';
  timeout?: number;
}

export interface Service {
  id?: string
  name: string
  description?: string
  type?: string
  url?: string
  status: ServiceStatusType
  icon: string
  category?: string
  statusCheck?: StatusCheckConfig;
  lastChecked?: Date;
  uptime?: number;
}

export const services: Service[] = [
  { 
    id: "home-site",
    name: "Home Website", 
    description: "This website you're currently viewing",
    category: "Web Service",
    icon: "globe",
    status: "online" as ServiceStatusType,
    statusCheck: {
      enabled: false,
    }
  },
  { 
    id: "cogworks-bot",
    name: "Cogworks Discord Bot", 
    description: "Multi-functional Discord Bot",
    category: "Bot Service",
    icon: "cog",
    status: "pending" as ServiceStatusType,
    url: "",
    statusCheck: {
      enabled: true,
      endpoint: "/api/bot-status", // bot api endpoint
      interval: 30000, // check every 30 seconds
      method: "GET",
      timeout: 5000
    }
  },
  /*
  { 
    id: "k8s-1",
    name: "Kubernetes", 
    description: "Container orchestration cluster",
    category: "Platform",
    icon: "server",
    status: "online" as ServiceStatusType,
    statusCheck: {
      enabled: true,
      endpoint: "/api/k8s-health",
      interval: 60000, // Check every minute
    }
  },
  { 
    id: "gitlab-1",
    name: "GitLab Runner", 
    description: "CI/CD automation service",
    category: "DevOps",
    icon: "cpu",
    status: "pending" as ServiceStatusType,
    url: "",
    statusCheck: {
      enabled: true,
      endpoint: "/api/gitlab-status",
      interval: 120000, // Check every 2 minutes
    }
  },
  */
];