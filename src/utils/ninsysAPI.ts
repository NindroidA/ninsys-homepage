import type { AboutData, AboutDataResponse, AboutSection } from "../types/about";
import type {
  CreateProjectInput,
  GitHubImportResponse,
  GitHubReposResponse,
  Project,
  ProjectResponse,
  ProjectsResponse,
  UpdateProjectInput,
} from "../types/projects";
import { API_BASE } from "./apiBase";

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
    status: "healthy" | "degraded" | "unhealthy";
    uptime: number;
    memory: { used: number; total: number };
    services: Record<string, boolean>;
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
/** Dispatched on `window` when the API rejects our token, so AuthContext can log out. */
export const UNAUTHORIZED_EVENT = "ninsys:unauthorized";

/**
 * Prefer the server's own error message over a bare status code — the previous
 * `API Error: 401` discarded the body and told the user nothing.
 */
async function describeError(response: Response): Promise<string> {
  try {
    const body = await response.clone().json();
    const message = body?.error ?? body?.message;
    if (typeof message === "string" && message) {
      return `${message} (${response.status})`;
    }
  } catch {
    // non-JSON body; fall through to the status line
  }
  return `API Error: ${response.status}`;
}

class NinSysAPI {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const { headers, ...restOptions } = options || {};

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...restOptions,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });

    if (!response.ok) {
      // A rejected token has to reach AuthContext, otherwise the UI keeps
      // claiming the user is signed in while every mutation silently fails.
      if (response.status === 401) {
        sessionStorage.removeItem("ninsys_auth_token");
        sessionStorage.removeItem("ninsys_auth_expires");
        window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
      }
      throw new Error(await describeError(response));
    }

    // 204 No Content (and any other empty body) is a success, but response.json()
    // throws on it — which used to surface as a failed delete/reorder for an
    // operation the server had already applied.
    if (response.status === 204 || response.headers.get("content-length") === "0") {
      return undefined as T;
    }

    const text = await response.text();
    return (text ? JSON.parse(text) : undefined) as T;
  }

  // Authenticated request - adds JWT token from sessionStorage
  private async authRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = sessionStorage.getItem("ninsys_auth_token");
    if (!token) {
      throw new Error("Not authenticated");
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
    return this.request<CogworksStats>("/v2/cogworks/stats");
  }

  async getCogworksStatus(): Promise<CogworksStatus> {
    return this.request<CogworksStatus>("/v2/cogworks/status");
  }

  // system health
  async getSystemHealth(): Promise<SystemHealth> {
    return this.request<SystemHealth>("/health");
  }

  // ===== Projects API ===== //

  /** Fetch all projects sorted by order field */
  async getProjects(): Promise<Project[]> {
    const response = await this.request<ProjectsResponse>("/v2/projects");
    return response.data.projects;
  }

  /** Create a new project (requires auth) */
  async createProject(input: CreateProjectInput): Promise<Project> {
    const response = await this.authRequest<ProjectResponse>("/v2/projects", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return response.data;
  }

  /** Update an existing project by ID (requires auth) */
  async updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
    const response = await this.authRequest<ProjectResponse>(`/v2/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
    return response.data;
  }

  /** Delete a project by ID (requires auth) */
  async deleteProject(id: string): Promise<void> {
    await this.authRequest<{ success: boolean }>(`/v2/projects/${id}`, {
      method: "DELETE",
    });
  }

  /** Reorder projects by passing array of IDs in desired order (requires auth) */
  async reorderProjects(projectIds: string[]): Promise<void> {
    await this.authRequest<{ success: boolean }>("/v2/projects/reorder", {
      method: "PUT",
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
  async getGitHubRepos(options?: {
    perPage?: number;
    sort?: "updated" | "pushed" | "full_name";
  }): Promise<GitHubReposResponse["data"]["repos"]> {
    const params = new URLSearchParams();
    if (options?.perPage) params.set("per_page", String(options.perPage));
    if (options?.sort) params.set("sort", options.sort);

    const queryString = params.toString();
    const endpoint = `/v2/github/repos${queryString ? `?${queryString}` : ""}`;

    const response = await this.request<GitHubReposResponse>(endpoint);
    return response.data.repos;
  }

  /**
   * Import a GitHub repository as a new project (requires auth).
   * Creates the project on the backend from the repo metadata.
   * @param repoName - The repository name (not full path, just the name)
   */
  async importGitHubRepo(repoName: string): Promise<Project> {
    const response = await this.authRequest<GitHubImportResponse>(`/v2/github/import/${repoName}`, {
      method: "POST",
    });
    return response.data.project;
  }

  // ===== About API ===== //

  async getAboutData(): Promise<AboutData> {
    const response = await this.request<AboutDataResponse>("/v2/about");
    return response.data;
  }

  async updateAboutData(data: Partial<AboutData>): Promise<AboutData> {
    const response = await this.authRequest<AboutDataResponse>("/v2/about", {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async updateAboutSections(sections: Pick<AboutSection, "id" | "order">[]): Promise<AboutData> {
    const response = await this.authRequest<AboutDataResponse>("/v2/about/sections", {
      method: "PUT",
      body: JSON.stringify({ sections }),
    });
    return response.data;
  }
}

export const ninsysAPI = new NinSysAPI();
