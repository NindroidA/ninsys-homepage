import { describe, expect, test } from "bun:test";
import type { Project } from "../types/projects";
import { PROJECT_CATEGORIES, projectCategoryLabel, projectSections } from "./projectCategories";

function project(id: string, category: Project["category"], order: number): Project {
  return {
    id,
    title: id,
    description: "",
    technologies: [],
    category,
    date: "2026-10",
    order,
    createdAt: "2026-10-01T00:00:00.000Z",
    updatedAt: "2026-10-01T00:00:00.000Z",
  };
}

describe("projectCategoryLabel", () => {
  test("keeps Current and shows the API's completed as Notable", () => {
    expect(projectCategoryLabel("current")).toBe("Current");
    expect(projectCategoryLabel("completed")).toBe("Notable");
  });

  test("covers every category the API accepts, once", () => {
    expect(PROJECT_CATEGORIES.map((c) => c.value)).toEqual(["current", "completed"]);
  });
});

describe("projectSections", () => {
  test("has no sections when there are no projects", () => {
    expect(projectSections([])).toEqual([]);
  });

  test("puts Current before Notable and keeps the admin order within each", () => {
    const projects = [
      project("a", "completed", 0),
      project("b", "current", 1),
      project("c", "completed", 2),
      project("d", "current", 3),
    ];

    const sections = projectSections(projects);

    expect(sections.map((s) => [s.category, s.label])).toEqual([
      ["current", "Current"],
      ["completed", "Notable"],
    ]);
    expect(sections[0]?.projects.map((p) => p.id)).toEqual(["b", "d"]);
    expect(sections[1]?.projects.map((p) => p.id)).toEqual(["a", "c"]);
  });

  test("leaves out a section with no projects", () => {
    expect(projectSections([project("a", "current", 0)]).map((s) => s.label)).toEqual(["Current"]);
    expect(projectSections([project("a", "completed", 0)]).map((s) => s.label)).toEqual([
      "Notable",
    ]);
  });
});
