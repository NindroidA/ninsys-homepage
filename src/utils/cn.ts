import { twMerge } from "tailwind-merge";

/**
 * Join conditional class names and resolve Tailwind conflicts (later wins).
 * Keeps caller overrides predictable when composing the shared UI primitives.
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return twMerge(classes.filter(Boolean).join(" "));
}
