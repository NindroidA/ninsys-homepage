import { AnimatePresence, motion } from "framer-motion";
import { KeyRound, Loader2, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IS_DEV } from "../../context/AuthContext";
import { useAuth } from "../../hooks/useAuth";
import { useModalA11y } from "../../hooks/useModalA11y";
import { TotpInput } from "./TotpInput";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called after a successful login, so the caller can navigate to the panel. */
  onSuccess?: () => void;
}

export function AdminLoginModal({ isOpen, onClose, onSuccess }: AdminLoginModalProps) {
  const { login, devLogin } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [clearSignal, setClearSignal] = useState(0);
  const panelRef = useModalA11y(isOpen, onClose);

  // Reset transient state each time the modal opens.
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setLoading(false);
      setClearSignal((s) => s + 1);
    }
  }, [isOpen]);

  const submit = async (code: string) => {
    setLoading(true);
    setError(null);
    const result = await login(code);
    setLoading(false);
    if (result.success) {
      onClose();
      onSuccess?.();
    } else {
      setError(result.error || "Authentication failed");
      setClearSignal((s) => s + 1);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-9999 bg-black/70 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-9999 flex items-center justify-center p-4"
            onClick={(e) => {
              // Dismiss only when the overlay itself is clicked, never a descendant.
              if (e.target === e.currentTarget) onClose();
            }}
          >
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="admin-login-modal-title"
              tabIndex={-1}
              className="w-full max-w-md rounded-2xl border border-purple-300/12 bg-[#0d0a16]/95 p-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_30px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-pink-500">
                    <KeyRound className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2
                      id="admin-login-modal-title"
                      className="font-display text-xl font-bold text-white"
                    >
                      Admin Login
                    </h2>
                    <p className="font-mono text-xs uppercase tracking-[0.16em] text-white/40">
                      enter your totp code
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
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
                    onClick={() => {
                      devLogin();
                      onSuccess?.();
                      onClose();
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/25 bg-linear-to-r from-amber-500/15 to-orange-500/15 px-4 py-3 font-medium text-amber-200 transition-colors hover:from-amber-500/25 hover:to-orange-500/25"
                  >
                    <Zap className="h-4 w-4" /> Dev Login (skip auth)
                  </button>
                  <p className="mt-2 text-center text-xs text-amber-500/60">
                    Only available on localhost
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
