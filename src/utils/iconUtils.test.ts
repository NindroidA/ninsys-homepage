import { describe, expect, test } from "bun:test";
import { Code2, Folder } from "lucide-react";
import { getLucideIcon, PROJECT_ICONS, SECTION_ICONS } from "./iconUtils";

describe("getLucideIcon", () => {
  test("returns the Lucide component for a known name", () => {
    expect(getLucideIcon("Folder")).toBe(Folder);
    expect(getLucideIcon("Code2")).toBe(Code2);
  });

  test("returns null for an unknown or empty name", () => {
    expect(getLucideIcon("NotAnIcon")).toBeNull();
    expect(getLucideIcon("")).toBeNull();
  });
});

// The admin icon pickers offer these names; each one has to resolve, or the
// project card or about section that stores it renders without an icon.
const PICKERS: Record<string, readonly { name: string; label: string }[]> = {
  SECTION_ICONS,
  PROJECT_ICONS,
};

for (const [picker, icons] of Object.entries(PICKERS)) {
  describe(picker, () => {
    test("every entry resolves to a Lucide icon", () => {
      const missing = icons.filter(({ name }) => getLucideIcon(name) === null);
      expect(missing).toEqual([]);
    });

    test("has no duplicate names", () => {
      const names = icons.map(({ name }) => name);
      expect(new Set(names).size).toBe(names.length);
    });
  });
}
