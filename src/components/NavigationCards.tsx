import { motion } from 'framer-motion';
import { ExternalLink, Server, Database, Globe, Shield, Settings, Monitor, Cloud, Terminal, Folder, ArrowRight, Zap } from 'lucide-react';
import { NavigationCard } from '../assets/navigationCards';

interface NavigationCardsProps {
  cards: NavigationCard[]
}

const iconMap = {
  server: Server,
  database: Database,
  globe: Globe,
  shield: Shield,
  settings: Settings,
  monitor: Monitor,
  cloud: Cloud,
  terminal: Terminal,
  folder: Folder
};

const colorMap = {
  blue: 'from-blue-400/80 to-purple-500/80',
  purple: 'from-purple-500/80 to-pink-500/80',
  green: 'from-emerald-400/80 to-cyan-500/80',
  orange: 'from-orange-400/80 to-pink-500/80',
  indigo: 'from-indigo-500/80 to-purple-500/80',
  teal: 'from-teal-400/80 to-blue-500/80',
  red: 'from-red-400/80 to-pink-500/80',
  cyan: 'from-cyan-400/80 to-blue-500/80'
};

export default function NavigationCards({ cards }: NavigationCardsProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full max-w-6xl mx-auto p-8"
    >
        {/* nav cards header */}
        <div className="text-center mb-12">
            <div className="bg-gradient-to-br from-white/8 via-gray-800/20 to-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
                <h2 className="text-3xl font-bold text-white mb-4">🚀 Quick Access</h2>
                <p className="text-white/70">Navigate to your homelab services and tools</p>
            </div>
        </div>

        {/* nav cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cards.map((card, index) => {
                const CardIcon = iconMap[card.icon as keyof typeof iconMap] || Server;
                const gradientColor = colorMap[card.color as keyof typeof colorMap] || colorMap.purple;

                return (
                    <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="group relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-200 transition-opacity duration-500 rounded-3xl blur-xl"></div>
                        <div className="relative bg-gradient-to-br from-white/12 via-gray-800/20 to-white/8 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:border-white/30 transition-all duration-200 hover:shadow-2xl hover:shadow-purple-500/20 hover:bg-gradient-to-br hover:from-white/15 hover:via-gray-700/25 hover:to-white/10">
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${gradientColor} backdrop-blur-sm flex items-center justify-center mb-6 shadow-lg border border-white/20`}>
                                <CardIcon className="w-8 h-8 text-white drop-shadow-lg" />
                            </div>
                            
                            <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
                            <p className="text-white/70 mb-6 leading-relaxed">{card.description}</p>
                            
                            <div className="flex items-center justify-between">
                                <a
                                    href={card.url}
                                    target={card.external ? '_blank' : '_self'}
                                    rel={card.external ? 'noopener noreferrer' : undefined}
                                    className="group/btn flex items-center gap-3 text-white font-medium transition-all duration-200 bg-gradient-to-r from-purple-500/20 via-gray-700/30 to-pink-500/20 hover:from-purple-500/30 hover:via-gray-600/40 hover:to-pink-500/30 px-6 py-3 rounded-2xl backdrop-blur-sm border border-white/20 hover:border-white/30 hover:shadow-lg hover:shadow-purple-500/20"
                                >
                                    <Zap className="w-4 h-4 text-purple-300 group-hover/btn:text-white transition-colors duration-200" />
                                    <span className="text-purple-200 group-hover/btn:text-white transition-colors duration-200">Launch</span>
                                    <ArrowRight className="w-4 h-4 text-purple-300 group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all duration-200" />
                                    {card.external && <ExternalLink className="w-3 h-3 text-purple-400 group-hover/btn:text-white transition-colors duration-200" />}
                                </a>
                            
                                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${gradientColor} shadow-lg`}></div>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    </motion.div>
  );
}