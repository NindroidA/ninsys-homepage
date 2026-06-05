import { motion } from "framer-motion";
import { FolderGit2, Home, Info } from "lucide-react";
import type { JSX } from "react";
import { Link, useLocation } from "react-router-dom";

interface NavbarProps {
  variant?: "default" | "minimal";
}

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/projects", label: "Projects", icon: FolderGit2 },
  { path: "/about", label: "About", icon: Info },
];

// Shared v2 glass treatment: purple-tinted hairline + light single blur.
const glass =
  "border border-purple-300/12 bg-white/[0.04] backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_16px_40px_-28px_rgba(0,0,0,0.8)]";
const activePill =
  "bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-[0_8px_24px_-10px_rgba(236,72,153,0.6)]";

export default function Navbar({ variant = "default" }: NavbarProps): JSX.Element {
  const location = useLocation();

  if (variant === "minimal") {
    return (
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-50 px-4 pb-4 pt-6"
      >
        <div className="mx-auto flex max-w-7xl justify-center">
          <div className={`rounded-full px-2 py-1.5 ${glass}`}>
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`rounded-full p-3 transition-all duration-200 ${
                      isActive ? activePill : "text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                    title={item.label}
                    aria-label={item.label}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </motion.nav>
    );
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 px-4 pb-4 pt-6"
    >
      <div className="mx-auto max-w-2xl">
        <div className={`rounded-2xl px-4 py-3 ${glass}`}>
          <div className="flex items-center justify-between gap-4">
            <Link
              to="/"
              className="font-display text-lg font-bold tracking-tight transition-opacity hover:opacity-80"
              aria-label="Nindroid Systems — home"
            >
              <span className="bg-gradient-to-b from-white to-[#cdbdf5] bg-clip-text text-transparent">
                N
              </span>
              <span className="bg-gradient-to-br from-[#d946ef] to-[#8b5cf6] bg-clip-text text-transparent">
                S
              </span>
            </Link>

            <div className="flex items-center gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 rounded-xl px-3.5 py-2 transition-all duration-200 ${
                      isActive ? activePill : "text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden text-sm font-medium md:inline">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
