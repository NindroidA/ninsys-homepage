import { ChevronDown, ChevronUp, Eye, EyeOff, RotateCcw } from "lucide-react";
import type { JSX } from "react";
import { Link } from "react-router-dom";
import { GlassPanel } from "../../components/ui/GlassPanel";
import { useSiteConfig } from "../../hooks/useSiteConfig";

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}): JSX.Element {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? "bg-linear-to-r from-violet-500 to-pink-500" : "bg-white/10"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export function AdminSiteConfig(): JSX.Element {
  const { config, toggleSection, moveSection, setEnable3DRack, reset } = useSiteConfig();

  return (
    <div>
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-white/40">
            {"// site control"}
          </span>
          <h1 className="mt-1 font-display text-3xl font-bold text-white sm:text-4xl">
            Site Config
          </h1>
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-lg border border-purple-300/12 bg-white/4 px-3 py-2 text-xs font-medium text-white/70 transition-colors hover:bg-white/8"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
      </header>

      <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/6 px-4 py-3 font-mono text-xs text-amber-200/80">
        Saved in your browser for now — this becomes server-side once the config API ships.
      </div>

      {/* homepage sections */}
      <GlassPanel className="mb-5 rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-white">Homepage sections</h2>
          <Link
            to="/"
            className="font-mono text-xs text-purple-200 transition-colors hover:text-white"
          >
            view homepage →
          </Link>
        </div>
        <p className="mb-4 text-sm text-white/45">
          Show, hide, and reorder the sections below the hero. The hero and footer are always shown.
        </p>
        <ul className="space-y-2">
          {config.sections.map((section, index) => (
            <li
              key={section.id}
              className={`flex items-center gap-3 rounded-xl border border-white/5 px-3 py-2.5 transition-opacity ${
                section.visible ? "bg-white/3" : "bg-white/1 opacity-50"
              }`}
            >
              <span className="font-mono text-[11px] text-white/30">{index + 1}</span>
              <span className="flex-1 text-sm text-white/85">{section.label}</span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveSection(section.id, -1)}
                  disabled={index === 0}
                  className="rounded p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                  aria-label={`Move ${section.label} up`}
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveSection(section.id, 1)}
                  disabled={index === config.sections.length - 1}
                  className="rounded p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                  aria-label={`Move ${section.label} down`}
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-purple-300/12 bg-white/4 px-2.5 py-1.5 font-mono text-[11px] text-white/70 transition-colors hover:bg-white/8"
                aria-label={`${section.visible ? "Hide" : "Show"} ${section.label}`}
              >
                {section.visible ? (
                  <>
                    <Eye className="h-3.5 w-3.5" /> shown
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3.5 w-3.5" /> hidden
                  </>
                )}
              </button>
            </li>
          ))}
        </ul>
      </GlassPanel>

      {/* behavior */}
      <GlassPanel className="rounded-2xl p-5">
        <h2 className="mb-4 font-display text-lg font-semibold text-white">Behavior</h2>
        <div className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/3 px-4 py-3">
          <div>
            <div className="text-sm text-white/85">3D server rack</div>
            <div className="text-xs text-white/45">
              Render the WebGL rack on capable devices. Off = always the lightweight 2D poster.
            </div>
          </div>
          <Toggle
            checked={config.enable3DRack}
            onChange={setEnable3DRack}
            label="Enable 3D server rack"
          />
        </div>
      </GlassPanel>
    </div>
  );
}
