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
    <GlassPanel interactive className="group flex h-full flex-col rounded-3xl p-6 sm:p-7">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-300/15 bg-gradient-to-br from-violet-500/25 to-pink-500/20">
        <CardIcon className="h-6 w-6 text-purple-100" />
      </div>

      {card.category && (
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/40">
          {card.category}
        </span>
      )}
      <h3 className="mt-1 font-display text-xl font-bold text-white">{card.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-white/55">{card.description}</p>

      <span className="mt-5 inline-flex items-center gap-2 font-mono text-sm text-purple-200 transition-colors group-hover:text-white">
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
        <h2 className="mt-1 font-display text-3xl font-bold text-white sm:text-4xl">Explore</h2>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {cards.map((card) => (
          <NavCard key={card.id} card={card} />
        ))}
      </div>
    </motion.div>
  );
}
