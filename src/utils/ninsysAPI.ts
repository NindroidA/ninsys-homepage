import { GoveeDevice } from "../types/govee";

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://nindroidsystems.com';

export interface CogworksStats {
  guilds: number;
  users: number;
  channels: number;
  uptime: number;
  memoryUsage: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
  };
  ping: number;
  version: string;
}

export interface CogworksStatus {
  online: boolean;
  uptime: number;
  ping: number;
  guilds: number;
  users: number;
  lastRestart: string;
  timestamp: string;
}

export interface SystemHealth {
  success: boolean;
  timestamp: string;
  data: {
    status: string;
    uptime: number;
    memory: any;
    services: any;
  };
}

export interface GoveeDevicesResponse {
  success: boolean;
  timestamp: string;
  data: {
    devices: GoveeDevice[];
    groups: any[];
  };
}

class NinSysAPI {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Cogworks endpoints
  async getCogworksStats(): Promise<CogworksStats> {
    return this.request<CogworksStats>('/api/cogworks/stats');
  }

  async getCogworksStatus(): Promise<CogworksStatus> {
    return this.request<CogworksStatus>('/api/cogworks/status');
  }

  // Govee endpoints
  async getGoveeDevices(): Promise<GoveeDevicesResponse> {
    return this.request<GoveeDevicesResponse>('/api/govee/devices');
  }

  async controlGoveeDevice(device: string, model: string, command: any): Promise<any> {
    return this.request('/api/govee/control', {
      method: 'PUT',
      body: JSON.stringify({ device, model, command }),
    });
  }

  async applyGoveePreset(presetId: string): Promise<any> {
    return this.request(`/api/govee/preset/${presetId}`, {
      method: 'PUT',
    });
  }

  // system health
  async getSystemHealth(): Promise<SystemHealth> {
    return this.request<SystemHealth>('/health');
  }
}

export const ninsysAPI = new NinSysAPI();