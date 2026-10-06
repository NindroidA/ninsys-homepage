import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { type FormEvent, type JSX, useEffect, useState } from "react";
import { useModalA11y } from "../../hooks/useModalA11y";
import {
  fromDraft,
  HOSTED_LIMITS,
  type HostedDraft,
  type HostedDraftErrors,
  newHostedId,
  toDraft,
  validateDraft,
} from "../../lib/siteConfig";
import type { HostedEntry, HostedStatus } from "../../types/siteConfig";
import { HOSTED_ICONS } from "../hostedIcons";

interface HostedEntryModalProps {
  isOpen: boolean;
  /** The entry being edited; undefined adds a new one. */
  entry?: HostedEntry;
  /** Ids already on the shelf, so a new entry gets an unused one. */
  takenIds: string[];
  onClose: () => void;
  /** Rejects with the API's error; the modal stays open and shows it. */
  onSave: (entry: HostedEntry) => Promise<void>;
}

const inputClass =
  "w-full px-4 py-3 bg-white/4 border border-purple-300/12 rounded-lg text-white placeholder-white/30 focus:outline-hidden focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/30 transition-all";
const labelClass = "mb-2 block text-sm font-medium text-white/70";

function FieldError({ id, message }: { id: string; message?: string }): JSX.Element | null {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-xs text-rose-300">
      {message}
    </p>
  );
}

export function HostedEntryModal({
  isOpen,
  entry,
  takenIds,
  onClose,
  onSave,
}: HostedEntryModalProps): JSX.Element {
  const panelRef = useModalA11y(isOpen, onClose);
  const [draft, setDraft] = useState<HostedDraft>(() => toDraft(entry));
  const [errors, setErrors] = useState<HostedDraftErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Start from the entry (or a blank one) each time the modal opens.
  useEffect(() => {
    if (!isOpen) return;
    setDraft(toDraft(entry));
    setErrors({});
    setSaveError(null);
    setSaving(false);
  }, [isOpen, entry]);

  const set = <K extends keyof HostedDraft>(key: K, value: HostedDraft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validateDraft(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSaving(true);
    setSaveError(null);
    try {
      await onSave(fromDraft(entry?.id ?? newHostedId(draft.name, takenIds), draft));
      onClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Couldn't save it");
    } finally {
      setSaving(false);
    }
  };

  const describedBy = (field: keyof HostedDraftErrors, hint?: string) =>
    [errors[field] ? `hosted-${field}-error` : "", hint ?? ""].filter(Boolean).join(" ") ||
    undefined;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="fixed inset-0 z-51 flex items-center justify-center p-4"
            onClick={(e) => {
              // Dismiss only when the overlay itself is clicked, never a descendant.
              if (e.target === e.currentTarget) onClose();
            }}
          >
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="hosted-entry-title"
              tabIndex={-1}
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-purple-300/12 bg-[#0d0a16]/95 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_30px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl"
            >
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 id="hosted-entry-title" className="font-display text-xl font-bold text-white">
                  {entry ? `Edit ${entry.name}` : "Add a Hosted entry"}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={submit} noValidate className="space-y-5">
                <div>
                  <label htmlFor="hosted-name" className={labelClass}>
                    Name
                  </label>
                  <input
                    id="hosted-name"
                    value={draft.name}
                    onChange={(e) => set("name", e.target.value)}
                    maxLength={HOSTED_LIMITS.name}
                    placeholder="Pluginator"
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={describedBy("name")}
                    className={inputClass}
                  />
                  <FieldError id="hosted-name-error" message={errors.name} />
                </div>

                <div>
                  <label htmlFor="hosted-description" className={labelClass}>
                    Description
                  </label>
                  <textarea
                    id="hosted-description"
                    value={draft.description}
                    onChange={(e) => set("description", e.target.value)}
                    maxLength={HOSTED_LIMITS.description}
                    rows={3}
                    aria-invalid={Boolean(errors.description)}
                    aria-describedby={describedBy("description", "hosted-description-count")}
                    className={`${inputClass} resize-none`}
                  />
                  <p
                    id="hosted-description-count"
                    className="mt-1 text-right font-mono text-[11px] text-white/30"
                  >
                    {draft.description.length}/{HOSTED_LIMITS.description}
                  </p>
                  <FieldError id="hosted-description-error" message={errors.description} />
                </div>

                <fieldset>
                  <legend className={labelClass}>Status</legend>
                  <div className="flex gap-2">
                    {(["live", "building"] as HostedStatus[]).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => set("status", status)}
                        aria-pressed={draft.status === status}
                        className={`flex-1 rounded-lg border px-3 py-2 font-mono text-xs transition-colors ${
                          draft.status === status
                            ? "border-purple-400/50 bg-purple-500/20 text-white"
                            : "border-purple-300/12 bg-white/4 text-white/60 hover:bg-white/8"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div>
                  <label htmlFor="hosted-url" className={labelClass}>
                    Live URL
                  </label>
                  <input
                    id="hosted-url"
                    type="url"
                    value={draft.url}
                    onChange={(e) => set("url", e.target.value)}
                    placeholder="https://…"
                    aria-invalid={Boolean(errors.url)}
                    aria-describedby={describedBy("url", "hosted-url-hint")}
                    className={inputClass}
                  />
                  <p id="hosted-url-hint" className="mt-1 text-xs text-white/35">
                    The card's Visit link. Leave it empty while it's still building.
                  </p>
                  <FieldError id="hosted-url-error" message={errors.url} />
                </div>

                <div>
                  <label htmlFor="hosted-repo" className={labelClass}>
                    GitHub repo
                  </label>
                  <input
                    id="hosted-repo"
                    type="url"
                    value={draft.repoUrl}
                    onChange={(e) => set("repoUrl", e.target.value)}
                    placeholder="https://github.com/NindroidA/…"
                    aria-invalid={Boolean(errors.repoUrl)}
                    aria-describedby={describedBy("repoUrl", "hosted-repo-hint")}
                    className={inputClass}
                  />
                  <p id="hosted-repo-hint" className="mt-1 text-xs text-white/35">
                    Public repos only: a private repo's link is a 404 for visitors.
                  </p>
                  <FieldError id="hosted-repoUrl-error" message={errors.repoUrl} />
                </div>

                <fieldset>
                  <legend className={labelClass}>Icon</legend>
                  <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
                    {Object.entries(HOSTED_ICONS).map(([key, Icon]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => set("icon", key)}
                        aria-pressed={draft.icon === key}
                        aria-label={key}
                        title={key}
                        className={`flex aspect-square items-center justify-center rounded-lg border transition-colors ${
                          draft.icon === key
                            ? "border-purple-400/60 bg-purple-500/25 text-white"
                            : "border-purple-300/12 bg-white/4 text-white/55 hover:bg-white/8"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div>
                  <label htmlFor="hosted-stack" className={labelClass}>
                    Stack tags
                  </label>
                  <input
                    id="hosted-stack"
                    value={draft.stack}
                    onChange={(e) => set("stack", e.target.value)}
                    placeholder="TypeScript, Bun, Web"
                    aria-invalid={Boolean(errors.stack)}
                    aria-describedby={describedBy("stack", "hosted-stack-hint")}
                    className={inputClass}
                  />
                  <p id="hosted-stack-hint" className="mt-1 text-xs text-white/35">
                    Comma-separated, up to {HOSTED_LIMITS.tags}. Three short ones read best.
                  </p>
                  <FieldError id="hosted-stack-error" message={errors.stack} />
                </div>

                <label className="flex items-center gap-3 text-sm text-white/70">
                  <input
                    type="checkbox"
                    checked={draft.visible}
                    onChange={(e) => set("visible", e.target.checked)}
                    className="h-4 w-4 accent-purple-500"
                  />
                  Show it on the homepage
                </label>

                {saveError && (
                  <p
                    role="alert"
                    className="rounded-lg border border-rose-500/25 bg-rose-500/8 px-3 py-2 font-mono text-xs text-rose-200"
                  >
                    Not saved: {saveError}
                  </p>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-lg border border-purple-300/12 bg-white/4 px-6 py-3 text-white/70 transition-colors hover:bg-white/8"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-linear-to-br from-violet-500 to-pink-500 px-6 py-3 font-medium text-white transition hover:brightness-110 disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                      </>
                    ) : entry ? (
                      "Save"
                    ) : (
                      "Add"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
