/* eslint-disable @typescript-eslint/no-explicit-any */
import { AboutData, AboutDataResponse, AboutSection } from '../types/about';
import { GoveeDevice } from '../types/govee';
import {
  CreateProjectInput,
  GitHubImportResponse,
  GitHubReposResponse,
  Project,
  ProjectResponse,
  ProjectsResponse,
  UpdateProjectInput,
} from '../types/projects';

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

/**
 * API client for the NinSys backend.
 * Handles all HTTP requests to the backend API including authentication.
 * Automatically selects localhost:3001 for development or production domain.
 *
 * Authentication: Uses JWT tokens stored in sessionStorage ('ninsys_auth_token').
 * All mutating operations (POST, PUT, DELETE) require authentication.
 */
class NinSysAPI {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const { headers, ...restOptions } = options || {};

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...restOptions,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Authenticated request - adds JWT token from sessionStorage
  private async authRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = sessionStorage.getItem('ninsys_auth_token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    return this.request<T>(endpoint, {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Bearer ${token}`,
      },
    });
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

  // ===== Projects API ===== //

  /** Fetch all projects sorted by order field */
  async getProjects(): Promise<Project[]> {
    const response = await this.request<ProjectsResponse>('/api/projects');
    return response.data.projects;
  }

  /** Create a new project (requires auth) */
  async createProject(input: CreateProjectInput): Promise<Project> {
    const response = await this.authRequest<ProjectResponse>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return response.data;
  }

  /** Update an existing project by ID (requires auth) */
  async updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
    const response = await this.authRequest<ProjectResponse>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
    return response.data;
  }

  /** Delete a project by ID (requires auth) */
  async deleteProject(id: string): Promise<void> {
    await this.authRequest<{ success: boolean }>(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  }

  /** Reorder projects by passing array of IDs in desired order (requires auth) */
  async reorderProjects(projectIds: string[]): Promise<void> {
    await this.authRequest<{ success: boolean }>('/api/projects/reorder', {
      method: 'PUT',
      body: JSON.stringify({ projectIds }),
    });
  }

  // ===== GitHub API ===== //

  /**
   * Fetch GitHub repositories for the authenticated user.
   * Uses server-stored GitHub PAT for authentication.
   * @param options.perPage - Number of repos to fetch (default: API default)
   * @param options.sort - Sort order: 'updated', 'pushed', or 'full_name'
   */
  async getGitHubRepos(options?: { perPage?: number; sort?: 'updated' | 'pushed' | 'full_name' }): Promise<GitHubReposResponse['data']['repos']> {
    const params = new URLSearchParams();
    if (options?.perPage) params.set('per_page', String(options.perPage));
    if (options?.sort) params.set('sort', options.sort);

    const queryString = params.toString();
    const endpoint = `/api/github/repos${queryString ? `?${queryString}` : ''}`;

    const response = await this.request<GitHubReposResponse>(endpoint);
    return response.data.repos;
  }

  /**
   * Import a GitHub repository as a new project (requires auth).
   * Creates the project on the backend from the repo metadata.
   * @param repoName - The repository name (not full path, just the name)
   */
  async importGitHubRepo(repoName: string): Promise<Project> {
    const response = await this.authRequest<GitHubImportResponse>(`/api/github/import/${repoName}`, {
      method: 'POST',
    });
    return response.data.project;
  }

  // ===== About API ===== //

  async getAboutData(): Promise<AboutData> {
    const response = await this.request<AboutDataResponse>('/api/about');
    return response.data;
  }

  async updateAboutData(data: Partial<AboutData>): Promise<AboutData> {
    const response = await this.authRequest<AboutDataResponse>('/api/about', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async updateAboutSections(sections: Pick<AboutSection, 'id' | 'order'>[]): Promise<AboutData> {
    const response = await this.authRequest<AboutDataResponse>('/api/about/sections', {
      method: 'PUT',
      body: JSON.stringify({ sections }),
    });
    return response.data;
  }
}

export const ninsysAPI = new NinSysAPI();