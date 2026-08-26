import { motion } from "framer-motion";
import { ArrowLeft, Home } from "lucide-react";
import type { JSX } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BackgroundNet } from "../components/background/BackgroundNet";
import { Seo } from "../components/Seo";
import { GlassPanel } from "../components/ui/GlassPanel";

export default function NotFound(): JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <Seo title="Page Not Found" noindex />
      <BackgroundNet />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-xl text-center"
      >
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
          {"// http 404"}
        </span>

        <h1 className="mt-3 font-display text-7xl font-bold leading-none tracking-tight sm:text-8xl">
          <span className="bg-linear-to-br from-white to-[#cdbdf5] bg-clip-text text-transparent">
            4
          </span>
          <span className="bg-linear-to-br from-[#d946ef] to-[#8b5cf6] bg-clip-text text-transparent">
            0
          </span>
          <span className="bg-linear-to-br from-white to-[#cdbdf5] bg-clip-text text-transparent">
            4
          </span>
        </h1>

        <p className="mt-4 font-mono text-lg uppercase tracking-[0.18em] text-white/70">
          rack unit not found
        </p>

        <GlassPanel className="mt-8 rounded-2xl p-5 text-left">
          <pre className="overflow-x-auto font-mono text-[13px] leading-relaxed text-white/55">
            <span className="text-white/35">$</span> systemctl status{" "}
            <span className="text-purple-200">{getAttemptedPath()}</span>
            {"\n"}
            <span className="text-rose-300">●</span> unit not mounted — no such page in this rack
          </pre>
        </GlassPanel>

        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-br from-violet-500 to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-12px_rgba(236,72,153,0.55)] transition hover:brightness-110"
          >
            <Home className="h-4 w-4" /> Back to Home
          </Link>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-300/12 bg-white/4 px-5 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/8"
          >
            <ArrowLeft className="h-4 w-4" /> Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/** The path the visitor tried to reach, for the fake terminal line. */
function getAttemptedPath(): string {
  if (typeof window === "undefined") return "/unknown";
  return window.location.pathname || "/unknown";
}
