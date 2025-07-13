export type ServiceStatusType = 'online' | 'offline' | 'pending' | 'maintenance';

export interface Service {
  id?: string
  name: string
  description?: string
  type?: string
  url?: string
  status: ServiceStatusType
  icon: string
  category?: string
}

export const services: Service[] = [
  { 
    id: "cogworks",
    name: "Cogworks", 
    description: "Multi-functional Discord Bot (not public yet)",
    category: "App",
    icon: "cog",
    status: "online" as ServiceStatusType,
    url: ""
  },
  /*
  { 
    id: "k8s-1",
    name: "Kubernetes", 
    description: "Container orchestration cluster",
    category: "Platform",
    icon: "server",
    status: "online" as ServiceStatusType
  },
  { 
    id: "gitlab-1",
    name: "GitLab Runner", 
    description: "CI/CD automation service",
    category: "DevOps",
    icon: "cpu",
    status: "pending" as ServiceStatusType,
    url: ""
  },*/
]