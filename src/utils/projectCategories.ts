import type { Project } from "../types/projects";

export type ProjectCategory = Project["category"];

/**
 * The project categories in Projects-page order, with the name the UI shows for each. The API
 * value stays `completed`; the site calls those projects "Notable".
 */
export const PROJECT_CATEGORIES: readonly { value: ProjectCategory; label: string }[] = [
  { value: "current", label: "Current" },
  { value: "completed", label: "Notable" },
];

/** What the UI calls a project category: "Current" or "Notable". */
export function projectCategoryLabel(category: ProjectCategory): string {
  return PROJECT_CATEGORIES.find((c) => c.value === category)?.label ?? category;
}

export interface ProjectSection {
  category: ProjectCategory;
  label: string;
  projects: Project[];
}

/**
 * The Projects page's sections: Current, then Notable. Each keeps the projects' own order (the
 * admin order), and a section with no projects is left out.
 */
export function projectSections(projects: Project[]): ProjectSection[] {
  return PROJECT_CATEGORIES.map(({ value, label }) => ({
    category: value,
    label,
    projects: projects.filter((p) => p.category === value),
  })).filter((section) => section.projects.length > 0);
}
