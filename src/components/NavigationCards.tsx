import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, Folder, Server, Settings, Terminal } from "lucide-react";
import type { JSX } from "react";
import { Link } from "react-router-dom";
import type { NavigationCard } from "../assets/navigationCards";
import { GlassPanel } from "./ui/GlassPanel";

interface NavigationCardsProps {
  cards: NavigationCard[];
}

const iconMap = {
  settings: Settings,
  terminal: Terminal,
  folder: Folder,
};

function NavCard({ card }: { card: NavigationCard }): JSX.Element {
  const CardIcon = iconMap[card.icon as keyof typeof iconMap] ?? Server;
  const ActionIcon = card.external ? ExternalLink : ArrowRight;

  const body = (
    <GlassPanel
      interactive
      className="group flex h-full flex-col rounded-2xl p-4 sm:rounded-3xl sm:p-7"
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-purple-300/15 bg-linear-to-br from-violet-500/25 to-pink-500/20 sm:mb-5 sm:h-12 sm:w-12 sm:rounded-2xl">
        <CardIcon className="h-5 w-5 text-purple-100 sm:h-6 sm:w-6" />
      </div>

      {card.category && (
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/40">
          {card.category}
        </span>
      )}
      <h3 className="mt-1 font-display text-base font-bold text-white sm:text-xl">{card.title}</h3>
      <p className="mt-1.5 flex-1 text-xs leading-snug text-white/55 sm:mt-2 sm:text-sm sm:leading-relaxed">
        {card.description}
      </p>

      <span className="mt-3 inline-flex items-center gap-1.5 font-mono text-xs text-purple-200 transition-colors group-hover:text-white sm:mt-5 sm:gap-2 sm:text-sm">
        {card.external ? "Launch" : "Open"}
        <ActionIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </GlassPanel>
  );

  return card.external ? (
    <a href={card.url} target="_blank" rel="noopener noreferrer" className="block">
      {body}
    </a>
  ) : (
    <Link to={card.url} className="block">
      {body}
    </Link>
  );
}

export default function NavigationCards({ cards }: NavigationCardsProps): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto w-full max-w-6xl"
    >
      <div className="mb-8">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-white/40">
          {"// have a look around"}
        </span>
        <h2 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl md:text-4xl">
          Explore
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        {cards.map((card) => (
          <NavCard key={card.id} card={card} />
        ))}
      </div>
    </motion.div>
  );
}
