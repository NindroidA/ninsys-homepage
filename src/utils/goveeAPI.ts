import { GoveeDevice } from '../types/govee';

export const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://nindroidsystems.com';

class GoveeAPI {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const apiKey = sessionStorage.getItem('ninsys_api_key');
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'X-API-Key': apiKey }),
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // handle auth failures
      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem('ninsys_api_key');
        throw new Error('Authentication failed. Please login again.');
      }
      
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  async getDevices(): Promise<GoveeDevice[]> {
    const response = await this.request<any>('/api/govee/devices');
    return response.data?.devices || [];
  }

  async getDeviceGroups(): Promise<any> {
    const response = await this.request<any>('/api/govee/devices');
    return response.data?.groups || {};
  }

  async controlGroup(groupId: string, commandName: string, value: any): Promise<any> {
    return this.request('/api/govee/control/group', {
      method: 'PUT',
      body: JSON.stringify({
        groupId: groupId,
        command: {
          name: commandName,
          value: value
        }
      })
    });
  }

  async applyPreset(presetId: string): Promise<any> {
    return this.request(`/api/govee/preset/${presetId}`, {
      method: 'PUT'
    });
  }

  rgbToInt(r: number, g: number, b: number): number {
    return (r << 16) | (g << 8) | b;
  }
}

export default GoveeAPI;