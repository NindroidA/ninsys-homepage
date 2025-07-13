import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Clock, Server, Database, Globe, Shield, Cpu, HardDrive, Cog } from 'lucide-react';
import { Service, ServiceStatusType } from '../assets/services';

interface StatusProps {
  services: Service[]
}

const statusConfig = {
  online: {
    icon: CheckCircle,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/20',
    pulse: ''
  },
  offline: {
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-400/20',
    pulse: ''
  },
  pending: {
    icon: AlertTriangle,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/20',
    pulse: 'animate-pulse'
  },
  maintenance: {
    icon: Clock,
    color: 'text-amber-400',
    bg: 'bg-amber-400/20',
    pulse: 'animate-pulse'
  }
};

const iconMap = {
  server: Server,
  database: Database,
  globe: Globe,
  shield: Shield,
  cpu: Cpu,
  storage: HardDrive,
  cog: Cog
};

// helper function to get status config (fallback to offline)
const getStatusConfig = (statusType: ServiceStatusType) => {
    return statusConfig[statusType] || statusConfig.offline;
}

// helper function to get the correct icon (with redundency)
const getServiceIcon = (iconName?: string) => {
    if (!iconName) return Server;
    return iconMap[iconName as keyof typeof iconMap] || Server;
}

export default function ServiceStatus({ services }: StatusProps) {
  const getStatusSummary = () => {
    const summary = services.reduce((acc, service) => {
      acc[service.status] = (acc[service.status] || 0) + 1;
      return acc;
    }, {} as Record<ServiceStatusType, number>);
    
    return summary;
  };

  const statusSummary = getStatusSummary();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full max-w-6xl mx-auto p-8"
    >
        {/* status header and count */}
        <div className="text-center mb-12">
            <div className="bg-gradient-to-br from-white/8 via-gray-800/20 to-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-4">System Status</h2>
                <div className="flex justify-center gap-8 text-sm flex-wrap">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50"></div>
                        <span className="text-white/80">{statusSummary.online || 0} Online</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full shadow-lg shadow-red-400/50"></div>
                        <span className="text-white/80">{statusSummary.offline || 0} Offline</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse shadow-lg shadow-amber-400/50"></div>
                        <span className="text-white/80">{statusSummary.maintenance || 0} Maintenance</span>
                    </div>
                    {statusSummary.pending && statusSummary.pending > 0 && (
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/50"></div>
                        <span className="text-white/80">{statusSummary.pending} Pending</span>
                    </div>
                    )}
                </div>
            </div>
        </div>

        {/* service cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
                const status = getStatusConfig(service.status);
                const StatusIcon = status.icon;
                const ServiceIcon = getServiceIcon(service.icon);

                return (
                    <motion.div
                    key={service.id || service.name}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-gradient-to-br from-white/12 via-gray-800/20 to-white/8 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 hover:bg-gradient-to-br hover:from-white/15 hover:via-gray-700/25 hover:to-white/10"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-white/15 via-gray-700/30 to-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                                    <ServiceIcon className="w-6 h-6 text-purple-300" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">{service.name}</h3>
                                    {service.category && (
                                    <p className="text-sm text-white/60">{service.category}</p>
                                    )}
                                </div>
                            </div>
                            <div className={`p-2 rounded-full ${status.bg} backdrop-blur-sm border border-white/20 ${status.pulse}`}>
                                <StatusIcon className={`w-4 h-4 ${status.color}`} />
                            </div>
                        </div>
                        
                        {service.description && (
                            <p className="text-white/70 text-sm mb-4">{service.description}</p>
                        )}
                        
                        <div className="flex items-center justify-between">
                            <span className={`text-sm font-medium ${status.color}`}>
                                {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                            </span>
                            {service.url && (
                            <a 
                                href={service.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-300 hover:text-purple-200 text-sm hover:underline transition-colors duration-200"
                            >
                                Access →
                            </a>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    </motion.div>
  );
}