import { motion } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle, Clock, Cog, Cpu, Database, Globe, HardDrive, Lightbulb, RefreshCw, Rocket, Server, Shield, Users, XCircle, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLiveServices } from '../hooks/useLiveServices';

const statusConfig = {
  online: {
    icon: CheckCircle,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/20',
    pulse: '',
    label: 'Online',
  },
  offline: {
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-400/20',
    pulse: 'animate-pulse',
    label: 'Offline',
  },
  maintenance: {
    icon: Clock,
    color: 'text-amber-400',
    bg: 'bg-amber-400/20',
    pulse: 'animate-pulse',
    label: 'Maintenance',
  },
  loading: {
    icon: AlertTriangle,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/20',
    pulse: 'animate-pulse',
    label: 'Loading',
  },
  coming_soon: {
    icon: Rocket,
    color: 'text-purple-400',
    bg: 'bg-purple-400/20',
    pulse: '',
    label: 'Coming Soon',
  },
};

const iconMap = {
  server: Server,
  database: Database,
  globe: Globe,
  shield: Shield,
  cpu: Cpu,
  storage: HardDrive,
  cog: Cog,
  users: Users,
  lightbulb: Lightbulb,
  activity: Activity,
  zap: Zap,
  rocket: Rocket,
};

const getStatusConfig = (statusType: string) => {
  return statusConfig[statusType as keyof typeof statusConfig] || statusConfig.offline;
};

const getServiceIcon = (iconName?: string) => {
  if (!iconName) return Server;
  return iconMap[iconName as keyof typeof iconMap] || Server;
};

export default function ServiceStatus() {
  const { services, loading, error, refresh } = useLiveServices();
  const [, setTick] = useState(0);

  // Trigger re-render every second for "last checked" time updates
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatLastChecked = (lastChecked?: string) => {
    if (!lastChecked) return '';
    const diff = Date.now() - new Date(lastChecked).getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
        
    if (minutes > 0) return `${minutes}m ${seconds}s ago`;
    return `${seconds}s ago`;
  };

  const getStatusSummary = () => {
    const summary = services.reduce((acc, service) => {
      acc[service.status] = (acc[service.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return summary;
  };

  const statusSummary = getStatusSummary();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="w-full max-w-8xl mx-auto p-8"
    >
      {/* Status header and count */}
      <div className="text-center mb-12">
        <div className="bg-gradient-to-br from-white/8 via-gray-800/20 to-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h2 className="text-3xl font-bold text-white">System Status</h2>
            <button
              onClick={refresh}
              disabled={loading}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors duration-200 disabled:opacity-50"
              title="Refresh all services"
            >
              <RefreshCw className={`w-5 h-5 text-white/80 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          
          <div className="flex justify-center gap-8 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50"></div>
              <span className="text-white/80">{statusSummary.online || 0} Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse shadow-lg shadow-red-400/50"></div>
              <span className="text-white/80">{statusSummary.offline || 0} Offline</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse shadow-lg shadow-amber-400/50"></div>
              <span className="text-white/80">{statusSummary.maintenance || 0} Maintenance</span>
            </div>
            {statusSummary.loading && statusSummary.loading > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/50"></div>
                <span className="text-white/80">{statusSummary.loading} Loading</span>
              </div>
            )}
            {statusSummary.coming_soon && statusSummary.coming_soon > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-400 rounded-full shadow-lg shadow-purple-400/50"></div>
                <span className="text-white/80">{statusSummary.coming_soon} Coming Soon</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Service cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => {
          const status = getStatusConfig(service.status);
          const StatusIcon = status.icon;
          const ServiceIcon = getServiceIcon(service.icon);

          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 + index * 0.1 }}
              className="bg-gradient-to-br from-white/12 via-gray-800/20 to-white/8 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 hover:bg-gradient-to-br hover:from-white/15 hover:via-gray-700/25 hover:to-white/10 min-h-[300px]"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-white/15 via-gray-700/30 to-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                    <ServiceIcon className="w-7 h-7 text-purple-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-lg mb-1">{service.name}</h3>
                    {service.category && (
                      <p className="text-sm text-white/60">{service.category}</p>
                    )}
                  </div>
                </div>
                <div className={`p-2 rounded-full ${status.bg} backdrop-blur-sm border border-white/20 ${status.pulse} flex-shrink-0`}>
                  <StatusIcon className={`w-4 h-4 ${status.color}`} />
                </div>
              </div>
              
              {service.description && (
                <p className="text-white/70 text-base mb-6 leading-relaxed">{service.description}</p>
              )}

              {service.stats && (service.stats.guilds || service.stats.users || service.stats.devices) && (
                <div className="mb-6 space-y-3 bg-white/5 rounded-xl p-4 border border-white/10">
                    {service.stats.guilds && (
                    <div className="flex justify-between text-base">
                        <span className="text-white/60">Servers:</span>
                        <span className="text-white/80 font-medium">{service.stats.guilds}</span>
                    </div>
                    )}
                    {service.stats.users && (
                    <div className="flex justify-between text-base">
                        <span className="text-white/60">Users:</span>
                        <span className="text-white/80 font-medium">{service.stats.users.toLocaleString()}</span>
                    </div>
                    )}
                    {service.stats.devices && (
                    <div className="flex justify-between text-base">
                        <span className="text-white/60">Devices:</span>
                        <span className="text-white/80 font-medium">{service.stats.devices}</span>
                    </div>
                    )}
                </div>
               )}

                <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                        <span className={`text-base font-medium ${status.color} mb-1`}>
                            {status.label}
                        </span>
                        {service.lastUpdated && (
                            <span className="text-m text-white/50">
                                Last checked: {formatLastChecked(service.lastUpdated)}
                            </span>
                        )}
                        {service.uptime && (
                            <span className="text-m text-white/50">
                                Uptime: {service.uptime}
                            </span>
                        )}
                    </div>
                </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}