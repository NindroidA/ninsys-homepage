import { motion } from "framer-motion";
import { Github } from "lucide-react";
import { Link } from "react-router-dom";
import { navigationCards } from "../assets/navigationCards";
import { BackgroundNet } from "../components/background/BackgroundNet";
import FooterComponent from "../components/Footer";
import NavigationCards from "../components/NavigationCards";
import ServiceStatus from "../components/ServiceStatus";
import { Wordmark } from "../components/ui/Wordmark";
import { useLiveServices } from "../hooks/useLiveServices";

export default function Homepage() {
  const { services } = useLiveServices();
  const online = services.filter((s) => s.status === "online").length;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 sm:px-8">
        <BackgroundNet />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="relative z-10 w-full max-w-4xl text-center"
        >
          <span className="inline-flex items-center gap-2 bg-[linear-gradient(135deg,#5eead4,#10b981)] bg-clip-text font-mono text-xs uppercase tracking-[0.18em] text-transparent">
            {"// systems · bots · homelab"}
            <span className="inline-block h-3.5 w-2 translate-y-0.5 bg-emerald-400 motion-safe:animate-[blink_1.1s_steps(1)_infinite]" />
          </span>

          <h1 className="mt-4 text-4xl leading-none sm:text-6xl md:text-7xl">
            <Wordmark />
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base text-white/60 sm:text-lg">
            Developer &amp; systems operator — I build and self-host bots, tools, and the occasional
            minecart.
          </p>

          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-xl border border-purple-500/20 bg-white/[0.04] px-4 py-2.5 font-mono text-[13px] backdrop-blur-md">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[linear-gradient(135deg,#5eead4,#10b981)] shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
              <span className="font-semibold text-white">{online}</span>
              <span className="text-white/40">services online</span>
            </span>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/projects"
              className="rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-12px_rgba(236,72,153,0.55)] transition hover:brightness-110"
            >
              View Projects
            </Link>
            <a
              href="https://github.com/NindroidA"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-purple-500/20 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/[0.08]"
            >
              <Github className="h-4 w-4" /> GitHub
            </a>
          </div>
        </motion.div>
      </section>

      {/* live status */}
      <section className="relative px-4 py-20 sm:px-8 sm:py-28">
        <ServiceStatus />
      </section>

      {/* nav cards */}
      <section className="relative px-4 py-16 sm:px-8">
        <NavigationCards cards={navigationCards} />
      </section>

      <FooterComponent />
    </div>
  );
}
