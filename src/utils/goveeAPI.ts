/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoveeDevice } from '../types/govee';

export const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://api.nindroidsystems.com';

class GoveeAPI {
  private getAuthHeaders(): Record<string, string> {
    const token = sessionStorage.getItem('ninsys_auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers
      }
    });

    // handle authentication errors
    if (response.status === 401) {
      // clear expired tokens
      sessionStorage.removeItem('ninsys_auth_token');
      sessionStorage.removeItem('ninsys_auth_expires');
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async getDevices(): Promise<GoveeDevice[]> {
    const response = await this.makeRequest('/v2/govee/devices');
    return response.data?.devices || [];
  }

  async getDeviceGroups(): Promise<any> {
    const response = await this.makeRequest('/v2/govee/devices');
    return response.data?.groups || {};
  }

  async getPresets(): Promise<any[]> {
    const result = await this.makeRequest('/v2/govee/presets');
    return result.data || [];
  }

  async applyPreset(presetId: string): Promise<any> {
    return this.makeRequest(`/v2/govee/preset/${presetId}`, {
      method: 'PUT'
    });
  }

  async controlDevice(deviceId: string, model: string, command: string, value: any): Promise<void> {
    await this.makeRequest('/v2/govee/control', {
      method: 'PUT',
      body: JSON.stringify({
        device: deviceId,
        model: model,
        command: {
          name: command,
          value: value
        }
      })
    });
  }

  async controlGroup(groupId: string, commandName: string, value: any): Promise<any> {
    return this.makeRequest('/v2/govee/control/group', {
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

  async controlAllDevices(command: string, value: any): Promise<void> {
    await this.makeRequest('/v2/govee/control/all', {
      method: 'PUT',
      body: JSON.stringify({
        command: {
          name: command,
          value: value
        }
      })
    });
  }

  rgbToInt(r: number, g: number, b: number): number {
    return (r << 16) | (g << 8) | b;
  }

  // helper method to check if user is authenticated
  static isAuthenticated(): boolean {
    const token = sessionStorage.getItem('ninsys_auth_token');
    const expires = sessionStorage.getItem('ninsys_auth_expires');
    
    if (!token || !expires) return false;
    
    return new Date(expires).getTime() > Date.now();
  }

  // helper method to get time until token expires
  static getTokenTimeRemaining(): number {
    const expires = sessionStorage.getItem('ninsys_auth_expires');
    if (!expires) return 0;
    
    return Math.max(0, new Date(expires).getTime() - Date.now());
  }
}

export default GoveeAPI;