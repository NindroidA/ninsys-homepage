import { useEffect, useState } from 'react';
import { ninsysAPI } from '../utils/ninsysAPI';

interface LiveService {
  id: string;
  name: string;
  description: string;
  status: 'online' | 'offline' | 'loading';
  uptime?: string;
  stats?: {
    guilds?: number;
    users?: number;
    ping?: number;
    devices?: number;
  };
  lastUpdated?: string;
  category?: string; 
  icon?: string;
}

export const useLiveServices = () => {
  const [services, setServices] = useState<LiveService[]>([
    {
      id: 'api',
      name: 'Nindroid Systems API',
      description: 'Backend API for Nindroid Systems',
      category: 'System Backend',
      icon: 'activity',
      status: 'loading',
    },
    {
      id: 'cogworks',
      name: 'Cogworks Bot',
      description: 'Multi-functional Discord Bot',
      category: 'Discord Bot',
      icon: 'cog',
      status: 'loading',
    },
    {
      id: 'govee',
      name: 'Smart Lights',
      description: 'Govee Lighting System',
      category: 'IoT Control',
      icon: 'lightbulb',
      status: 'loading',
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServiceData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [cogworksStatus, goveeDevices, systemHealth] = await Promise.allSettled([
        ninsysAPI.getCogworksStatus(),
        ninsysAPI.getGoveeDevices(),
        ninsysAPI.getSystemHealth(),
      ]);

      const now = new Date().toISOString();

      setServices([
        {
          id: 'api',
          name: 'Nindroid Systems API',
          description: 'Backend API for Nindroid Systems',
          category: 'System Backend',
          icon: 'activity',
          status: systemHealth.status === 'fulfilled' && systemHealth.value.data?.status === 'healthy' ? 'online' : 'offline',
          lastUpdated: now,
        },
        {
          id: 'cogworks',
          name: 'Cogworks Bot',
          description: 'Multi-functional Discord Bot',
          category: 'Discord Integration',
          icon: 'cog',
          status: cogworksStatus.status === 'fulfilled' && cogworksStatus.value.online ? 'online' : 'offline',
          uptime: cogworksStatus.status === 'fulfilled' ? formatUptime(cogworksStatus.value.uptime) : undefined,
          stats: cogworksStatus.status === 'fulfilled' ? {
            ping: cogworksStatus.value.ping,
          } : undefined,
          lastUpdated: now,
        },
        {
          id: 'govee',
          name: 'Smart Lights',
          description: 'Govee lighting system integration',
          category: 'IoT Control',
          icon: 'lightbulb',
          status: goveeDevices.status === 'fulfilled' && goveeDevices.value.success ? 'online' : 'offline',
          stats: goveeDevices.status === 'fulfilled' && goveeDevices.value.data?.devices ? {
            devices: goveeDevices.value.data.devices.length,
          } : undefined,
          lastUpdated: now,
        },
      ]);
    } catch (err) {
      console.error('Service fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch service data');
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  useEffect(() => {
    fetchServiceData();
    
    // refresh every 1 minute
    const interval = setInterval(fetchServiceData, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    services,
    loading,
    error,
    refresh: fetchServiceData,
  };
};