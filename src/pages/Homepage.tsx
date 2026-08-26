import { motion } from "framer-motion";
import { Fragment } from "react";
import { Link } from "react-router-dom";
import { navigationCards } from "../assets/navigationCards";
import { BackgroundNet } from "../components/background/BackgroundNet";
import FooterComponent from "../components/Footer";
import HostedShelf from "../components/HostedShelf";
import { GithubIcon } from "../components/icons/BrandIcons";
import NavigationCards from "../components/NavigationCards";
import ServiceStatus from "../components/ServiceStatus";
import { Wordmark } from "../components/ui/Wordmark";
import { useLiveServices } from "../hooks/useLiveServices";
import { useSiteConfig } from "../hooks/useSiteConfig";
import type { HomeSectionId } from "../types/siteConfig";

// Homepage sections that the admin Site Config can show/hide and reorder.
const SECTIONS: Record<HomeSectionId, () => React.ReactElement> = {
  status: () => (
    <section className="relative px-4 py-12 sm:px-8 sm:py-28">
      <ServiceStatus />
    </section>
  ),
  hosted: () => (
    <section className="relative px-4 pb-4 sm:px-8">
      <HostedShelf />
    </section>
  ),
  nav: () => (
    <section className="relative px-4 py-10 sm:px-8 sm:py-16">
      <NavigationCards cards={navigationCards} />
    </section>
  ),
};

export default function Homepage() {
  const { services } = useLiveServices();
  const online = services.filter((s) => s.status === "online").length;
  const { config } = useSiteConfig();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* hero */}
      <section className="relative flex min-h-[78svh] items-center justify-center overflow-hidden px-4 sm:min-h-screen sm:px-8">
        <BackgroundNet />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="relative z-10 w-full max-w-4xl text-center"
        >
          <span className="inline-flex items-center gap-1.5 bg-[linear-gradient(135deg,#5eead4,#10b981)] bg-clip-text font-mono text-[10px] uppercase tracking-[0.12em] text-transparent sm:gap-2 sm:text-xs sm:tracking-[0.18em]">
            {"// bots, tools, and one stubborn homelab"}
            <span className="inline-block h-3 w-1.5 translate-y-0.5 bg-emerald-400 motion-safe:animate-[blink_1.1s_steps(1)_infinite] sm:h-3.5 sm:w-2" />
          </span>

          <h1 className="mt-3 text-[2rem] leading-none sm:mt-4 sm:text-6xl md:text-7xl">
            <Wordmark />
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm text-white/60 sm:mt-4 sm:text-lg">
            personal development by a silly guy :3
          </p>

          <div className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg border border-purple-500/20 bg-white/4 px-3 py-2 font-mono text-[11px] backdrop-blur-md sm:mt-6 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-[13px]">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[linear-gradient(135deg,#5eead4,#10b981)] shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
              <span className="font-semibold text-white">{online}</span>
              <span className="text-white/40">services online</span>
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 sm:mt-7 sm:gap-3">
            <Link
              to="/projects"
              className="rounded-xl bg-linear-to-br from-violet-500 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_-12px_rgba(236,72,153,0.55)] transition hover:brightness-110 sm:px-5 sm:py-3"
            >
              View Projects
            </Link>
            <a
              href="https://github.com/NindroidA"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-purple-500/20 bg-white/4 px-4 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/8 sm:px-5 sm:py-3"
            >
              <GithubIcon className="h-4 w-4" /> GitHub
            </a>
          </div>
        </motion.div>
      </section>

      {/* configurable sections (admin Site Config controls visibility + order) */}
      {config.sections
        .filter((s) => s.visible)
        .map((s) => (
          <Fragment key={s.id}>{SECTIONS[s.id]()}</Fragment>
        ))}

      <FooterComponent />
    </div>
  );
}
