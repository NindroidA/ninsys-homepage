import { type JSX, type KeyboardEvent, useEffect, useRef, useState } from "react";

interface TotpInputProps {
  /** Called with the 6-digit code once all digits are entered (or pasted). */
  onSubmit: (code: string) => void;
  disabled?: boolean;
  /** Change this value to clear the inputs and refocus (e.g. after a failed attempt). */
  clearSignal?: number;
}

/**
 * The shared 6-digit TOTP entry used by both the `/admin` login screen and the
 * footer-key login modal, so they look and behave identically.
 */
export function TotpInput({ onSubmit, disabled, clearSignal = 0 }: TotpInputProps): JSX.Element {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset + focus the first box on mount and whenever clearSignal changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: clearSignal is the intended trigger
  useEffect(() => {
    setCode(["", "", "", "", "", ""]);
    const t = setTimeout(() => inputs.current[0]?.focus(), 50);
    return () => clearTimeout(t);
  }, [clearSignal]);

  const onChange = (index: number, raw: string) => {
    if (!/^\d*$/.test(raw)) return;
    const next = [...code];
    next[index] = raw.slice(-1);
    setCode(next);
    if (raw && index < 5) inputs.current[index + 1]?.focus();
    if (raw && index === 5 && next.every(Boolean)) onSubmit(next.join(""));
  };

  const onKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) inputs.current[index - 1]?.focus();
  };

  const onPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
      onSubmit(pasted);
    }
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: group-level paste handler is intentional
    <div className="flex justify-center gap-2.5" onPaste={onPaste}>
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
          disabled={disabled}
          aria-label={`Digit ${index + 1}`}
          className="h-14 w-12 rounded-xl border border-purple-300/12 bg-white/4 text-center font-display text-2xl font-bold text-white outline-hidden transition-colors focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/30 disabled:opacity-50"
        />
      ))}
    </div>
  );
}
