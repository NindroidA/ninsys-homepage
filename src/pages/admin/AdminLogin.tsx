import { KeyRound, Loader2, Zap } from "lucide-react";
import { type JSX, useState } from "react";
import { Link } from "react-router-dom";
import { TotpInput } from "../../components/admin/TotpInput";
import { BackgroundNet } from "../../components/background/BackgroundNet";
import { GlassPanel } from "../../components/ui/GlassPanel";
import { IS_DEV } from "../../context/AuthContext";
import { useAuth } from "../../hooks/useAuth";

/** Full-page TOTP gate for the admin area. */
export function AdminLogin(): JSX.Element {
  const { login, devLogin } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [clearSignal, setClearSignal] = useState(0);

  const submit = async (code: string) => {
    setLoading(true);
    setError(null);
    const result = await login(code);
    setLoading(false);
    if (!result.success) {
      setError(result.error || "Authentication failed");
      setClearSignal((s) => s + 1);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <BackgroundNet />
      <GlassPanel className="relative z-10 w-full max-w-md rounded-3xl p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-pink-500">
            <KeyRound className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-white">Admin Access</h1>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-white/40">
              enter your totp code
            </p>
          </div>
        </div>

        <div className="mb-5">
          <TotpInput onSubmit={submit} disabled={loading} clearSignal={clearSignal} />
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
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/25 bg-linear-to-r from-amber-500/15 to-orange-500/15 px-4 py-3 font-medium text-amber-200 transition-colors hover:from-amber-500/25 hover:to-orange-500/25"
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
