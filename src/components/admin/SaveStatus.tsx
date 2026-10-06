import { Check, CloudOff, Loader2, RotateCcw, TriangleAlert } from "lucide-react";
import type { JSX } from "react";
import { useSiteConfig } from "../../hooks/useSiteConfig";

/**
 * The line under the Site Config and Hosted titles: where the config lives and
 * whether the last change reached the API. Changes save as they're made, so this
 * is the only feedback that they did.
 */
export function SaveStatus(): JSX.Element {
  const { stored, loadError, saveState, retrySave } = useSiteConfig();

  if (saveState.status === "error") {
    return (
      <div
        role="alert"
        className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-rose-500/25 bg-rose-500/8 px-4 py-3 font-mono text-xs text-rose-200/90"
      >
        <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
        <span className="min-w-0 flex-1">Not saved: {saveState.error}</span>
        <button
          type="button"
          onClick={retrySave}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300/20 px-2.5 py-1 text-rose-100 transition-colors hover:bg-rose-500/15"
        >
          <RotateCcw className="h-3 w-3" /> Retry
        </button>
      </div>
    );
  }

  let icon = <Check className="h-3.5 w-3.5 shrink-0 text-emerald-300" />;
  let text = "Changes save to the API as you make them, for every visitor.";
  if (saveState.status === "saving") {
    icon = <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-purple-200" />;
    text = "Saving…";
  } else if (saveState.status === "saved") {
    text = "Saved. Every visitor sees it now.";
  } else if (loadError) {
    icon = <CloudOff className="h-3.5 w-3.5 shrink-0 text-amber-300" />;
    text = `Can't reach the API (${loadError}), so this shows the cached or default layout.`;
  } else if (stored === false) {
    icon = <CloudOff className="h-3.5 w-3.5 shrink-0 text-amber-300" />;
    text =
      "Nothing saved on the API yet, so the homepage shows the defaults. Your first change saves all of it.";
  } else if (stored === null) {
    icon = <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-white/40" />;
    text = "Loading the saved config…";
  }

  return (
    <div
      aria-live="polite"
      className="mb-6 flex items-center gap-3 rounded-xl border border-purple-300/12 bg-white/3 px-4 py-3 font-mono text-xs text-white/60"
    >
      {icon}
      <span className="min-w-0">{text}</span>
    </div>
  );
}
