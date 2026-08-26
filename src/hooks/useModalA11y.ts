import { useEffect, useRef } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * The dialog behaviour every modal in the app needs but none of them had:
 * close on Escape, keep Tab inside the panel while it is open, and hand focus
 * back to whatever opened it on close.
 *
 * Returns a ref to put on the modal panel. The panel also needs `tabIndex={-1}`
 * so it can take focus itself when it contains nothing focusable yet, plus
 * `role="dialog"`, `aria-modal="true"` and an `aria-labelledby` pointing at its
 * heading — those stay at the call site so each modal names itself.
 */
export function useModalA11y(isOpen: boolean, onClose: () => void) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const opener = document.activeElement as HTMLElement | null;

    const focusables = (): HTMLElement[] => {
      const root = panelRef.current;
      if (!root) return [];
      // offsetParent is null for display:none subtrees, so collapsed sections
      // don't become invisible tab stops.
      return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      );
    };

    // Defer: the panel mounts inside an AnimatePresence transition.
    const focusTimer = window.setTimeout(() => {
      const [first] = focusables();
      (first ?? panelRef.current)?.focus();
    }, 0);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;

      const active = document.activeElement;
      const inside = panelRef.current?.contains(active) ?? false;

      if (e.shiftKey && (active === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKey);
      // Only restore if focus is still somewhere we put it, so we don't yank it
      // away from wherever the user has since clicked.
      if (opener?.isConnected) opener.focus();
    };
  }, [isOpen, onClose]);

  return panelRef;
}
