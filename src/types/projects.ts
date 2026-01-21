// Project data model - matches backend API spec
export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  category: 'current' | 'completed';
  image?: string;
  icon?: string;
  githubUrl?: string;
  liveUrl?: string;
  date: string;
  featured?: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// For creating a new project (no id, order, timestamps)
export interface CreateProjectInput {
  title: string;
  description: string;
  technologies: string[];
  category: 'current' | 'completed';
  image?: string;
  icon?: string;
  githubUrl?: string;
  liveUrl?: string;
  date: string;
  featured?: boolean;
}

// For updating a project (all fields optional except id)
export interface UpdateProjectInput {
  title?: string;
  description?: string;
  technologies?: string[];
  category?: 'current' | 'completed';
  image?: string;
  icon?: string;
  githubUrl?: string;
  liveUrl?: string;
  date?: string;
  featured?: boolean;
}

// GitHub repo from API
export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  pushed_at: string;
}

// API response types
export interface ProjectsResponse {
  success: boolean;
  data: {
    projects: Project[];
  };
}

export interface ProjectResponse {
  success: boolean;
  data: Project;
}

export interface GitHubReposResponse {
  success: boolean;
  data: {
    repos: GitHubRepo[];
  };
}

export interface GitHubImportResponse {
  success: boolean;
  data: {
    project: Project;
  };
}
