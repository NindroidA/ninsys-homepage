// ===== Projects ===== //
export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  category: 'current' | 'completed';
  image?: string;
  githubUrl?: string;
  liveUrl?: string;
  date: string;
  featured?: boolean;
}

// ===== Terminal ===== //
export interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
  timestamp?: string;
}
