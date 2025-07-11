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
      id: "proxmox-1",
      name: "Proxmox Cluster", 
      description: "Virtualization management platform",
      category: "Infrastructure",
      icon: "server",
      status: "online" as ServiceStatusType,
      url: ""
    },
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
    },
    { 
      id: "monitoring-1",
      name: "Monitoring Stack", 
      description: "Prometheus, Grafana, and alerting",
      category: "Observability",
      icon: "shield",
      status: "online" as ServiceStatusType
    },
    { 
      id: "database-1",
      name: "Database Cluster", 
      description: "PostgreSQL high-availability cluster",
      category: "Data",
      icon: "database",
      status: "offline" as ServiceStatusType
    },
    { 
      id: "backup-1",
      name: "Backup Service", 
      description: "Automated backup and recovery",
      category: "Storage",
      icon: "storage",
      status: "maintenance" as ServiceStatusType
    }
  ]