import { describe, expect, test } from "bun:test";
import { cn } from "./cn";

describe("cn", () => {
  test("joins class names with single spaces", () => {
    expect(cn("flex", "items-center", "gap-2")).toBe("flex items-center gap-2");
  });

  test("skips false, null, undefined and empty strings", () => {
    expect(cn("flex", false, null, undefined, "", "gap-2")).toBe("flex gap-2");
  });

  test("returns an empty string when nothing is left", () => {
    expect(cn()).toBe("");
    expect(cn(false, null, undefined)).toBe("");
  });

  test("lets a later Tailwind class override a conflicting earlier one", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
    expect(cn("text-white/60", "text-white")).toBe("text-white");
  });

  test("keeps variant classes that don't conflict", () => {
    expect(cn("bg-white/5 hover:bg-white/10", "bg-white/10")).toBe("hover:bg-white/10 bg-white/10");
  });
});
