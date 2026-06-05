import { KeyRound, Loader2, Zap } from "lucide-react";
import { type JSX, type KeyboardEvent, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BackgroundNet } from "../../components/background/BackgroundNet";
import { GlassPanel } from "../../components/ui/GlassPanel";
import { IS_DEV } from "../../context/AuthContext";
import { useAuth } from "../../hooks/useAuth";

/** Full-page TOTP gate for the admin area. */
export function AdminLogin(): JSX.Element {
  const { login, devLogin } = useAuth();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const submit = async (value: string) => {
    if (value.length !== 6) return;
    setLoading(true);
    setError(null);
    const result = await login(value);
    setLoading(false);
    if (!result.success) {
      setError(result.error || "Authentication failed");
      setCode(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    }
  };

  const onChange = (index: number, raw: string) => {
    if (!/^\d*$/.test(raw)) return;
    const next = [...code];
    next[index] = raw.slice(-1);
    setCode(next);
    setError(null);
    if (raw && index < 5) inputs.current[index + 1]?.focus();
    if (raw && index === 5 && next.every(Boolean)) submit(next.join(""));
  };

  const onKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) inputs.current[index - 1]?.focus();
  };

  const onPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
      submit(pasted);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <BackgroundNet />
      <GlassPanel className="relative z-10 w-full max-w-md rounded-3xl p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500">
            <KeyRound className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-white">Admin Access</h1>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-white/40">
              enter your totp code
            </p>
          </div>
        </div>

        {/* biome-ignore lint/a11y/noStaticElementInteractions: paste handler on the group is intentional */}
        <div className="mb-5 flex justify-center gap-2.5" onPaste={onPaste}>
          {code.map((digit, index) => (
            <input
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length positional inputs
              key={index}
              ref={(el) => {
                inputs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => onChange(index, e.target.value)}
              onKeyDown={(e) => onKeyDown(index, e)}
              disabled={loading}
              aria-label={`Digit ${index + 1}`}
              className="h-14 w-12 rounded-xl border border-purple-300/12 bg-white/[0.04] text-center font-display text-2xl font-bold text-white outline-none transition-colors focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/30 disabled:opacity-50"
            />
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-center text-sm text-rose-300">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 text-white/60">
            <Loader2 className="h-5 w-5 animate-spin" /> Verifying…
          </div>
        )}

        <p className="mt-4 text-center text-sm text-white/40">
          Enter the 6-digit code from your authenticator app.
        </p>

        {IS_DEV && (
          <div className="mt-6 border-t border-white/5 pt-4">
            <button
              type="button"
              onClick={devLogin}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/25 bg-gradient-to-r from-amber-500/15 to-orange-500/15 px-4 py-3 font-medium text-amber-200 transition-colors hover:from-amber-500/25 hover:to-orange-500/25"
            >
              <Zap className="h-4 w-4" /> Dev Login (skip auth)
            </button>
            <p className="mt-2 text-center text-xs text-amber-500/60">
              Only available on localhost
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="font-mono text-xs text-white/40 transition-colors hover:text-white/70"
          >
            ← back to site
          </Link>
        </div>
      </GlassPanel>
    </div>
  );
}
