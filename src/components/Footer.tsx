import { Coffee } from "lucide-react";
import type { JSX } from "react";
import { version } from "../../package.json";
import { AdminLoginButton } from "./admin/AdminLoginButton";
import { GithubIcon } from "./icons/BrandIcons";
import { GlassPanel } from "./ui/GlassPanel";

export default function FooterComponent(): JSX.Element {
  return (
    <footer className="relative px-4 py-6 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <GlassPanel className="rounded-2xl p-5 sm:rounded-3xl sm:p-8 md:p-10">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:gap-6">
            <div className="text-center md:text-left">
              <h3 className="font-display text-xl font-bold">
                <span className="bg-linear-to-b from-white to-[#cdbdf5] bg-clip-text text-transparent">
                  Nindroid
                </span>{" "}
                <span className="bg-linear-to-br from-[#d946ef] to-[#8b5cf6] bg-clip-text text-transparent">
                  Systems
                </span>
              </h3>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-white/40 sm:text-xs sm:tracking-[0.16em]">
                Built with a passion for programming
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://github.com/NindroidA"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-purple-300/12 bg-white/4 p-2.5 text-white/70 transition-colors hover:bg-white/8 hover:text-white"
                aria-label="GitHub"
              >
                <GithubIcon className="h-5 w-5" />
              </a>
              <a
                href="https://buymeacoffee.com/nindroida"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 rounded-xl border border-amber-500/25 bg-linear-to-r from-amber-500/15 to-orange-500/15 px-3 py-2 text-amber-200 transition-all duration-200 hover:from-amber-500/25 hover:to-orange-500/25 hover:text-amber-100 sm:px-4 sm:py-2.5"
              >
                <Coffee className="h-5 w-5 transition-transform group-hover:scale-110" />
                <span className="text-sm font-medium">Buy Me a Coffee</span>
              </a>
            </div>

            <div className="flex items-center gap-4">
              <AdminLoginButton variant="subtle" />
              <div className="rounded-xl border border-white/5 bg-white/2 px-3 py-2 text-center font-mono text-[11px] text-white/50 md:px-5 md:py-3 md:text-xs md:text-right">
                <p className="text-white/70">v{version}</p>
                <p className="mt-0.5">by Andrew Curtis</p>
              </div>
            </div>
          </div>
        </GlassPanel>
      </div>
    </footer>
  );
}
