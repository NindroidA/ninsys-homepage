import { useState, useEffect } from 'react';
import { Service, ServiceStatusType } from '../assets/services';

interface StatusCheckConfig {
  enabled: boolean;
  endpoint?: string;
  interval?: number; // in milliseconds
  method?: 'GET' | 'POST';
  timeout?: number;
}

interface EnhancedService extends Service {
  statusCheck?: StatusCheckConfig;
  lastChecked?: Date;
  uptime?: number;
}

export const useServiceStatus = (initialServices: EnhancedService[]) => {
  const [services, setServices] = useState<EnhancedService[]>(initialServices);
  const [isLoading, setIsLoading] = useState(false);

  const checkServiceStatus = async (service: EnhancedService): Promise<ServiceStatusType> => {
    if (!service.statusCheck?.enabled || !service.statusCheck?.endpoint) {
      return service.status; // return default status if no check configured
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), service.statusCheck.timeout || 5000);

      const response = await fetch(service.statusCheck.endpoint, {
        method: service.statusCheck.method || 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        // if custom endpoint, check the response
        if (service.statusCheck.endpoint.includes('/api/')) {
          const data = await response.json();
          return data.status || 'online';
        }
        return 'online';
      } else {
        return 'offline';
      }
    } catch (error) {
      console.error(`Status check failed for ${service.name}:`, error);
      return 'offline';
    }
  };

  const updateServiceStatuses = async () => {
    setIsLoading(true);
    
    const updatedServices = await Promise.all(
      services.map(async (service) => {
        const newStatus = await checkServiceStatus(service);
        return {
          ...service,
          status: newStatus,
          lastChecked: new Date(),
        };
      })
    );

    setServices(updatedServices);
    setIsLoading(false);
  };

  const refreshStatus = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      checkServiceStatus(service).then(newStatus => {
        setServices(prev => prev.map(s => 
          s.id === serviceId 
            ? { ...s, status: newStatus, lastChecked: new Date() }
            : s
        ));
      });
    }
  };

  useEffect(() => {
    // initial status check
    updateServiceStatuses();

    // set up intervals for services that have status checking enabled
    const intervals: NodeJS.Timeout[] = [];

    services.forEach(service => {
      if (service.statusCheck?.enabled && service.statusCheck?.interval) {
        const intervalId = setInterval(() => {
          refreshStatus(service.id!);
        }, service.statusCheck.interval);
        intervals.push(intervalId);
      }
    });

    // cleanup intervals on unmount
    return () => {
      intervals.forEach(clearInterval);
    };
  }, []);

  return {
    services,
    isLoading,
    refreshStatus,
    updateServiceStatuses,
  };
};