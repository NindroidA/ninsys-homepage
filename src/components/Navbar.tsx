import { motion } from 'framer-motion';
import { FolderGit2, Home, Info, Terminal as TerminalIcon, Train } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
  variant?: 'default' | 'minimal';
}

export default function Navbar({ variant = 'default' }: NavbarProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/projects', label: 'Projects', icon: FolderGit2 },
    { path: '/railways', label: 'Railways', icon: Train },
    { path: '/about', label: 'About', icon: Info },
    { path: '/terminal', label: 'Terminal', icon: TerminalIcon }
  ];

  if (variant === 'minimal') {
    return (
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-50 pt-6 pb-4 px-4"
      >
        <div className="max-w-7xl mx-auto flex justify-center">
          <div className="bg-gradient-to-br from-white/10 via-gray-800/15 to-white/8 backdrop-blur-xl rounded-full px-4 py-2 border border-white/20 shadow-2xl">
            <div className="flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`p-3 rounded-full transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                    title={item.label}
                  >
                    <Icon className="w-5 h-5" />
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
      className="sticky top-0 z-50 pt-6 pb-4 px-4"
    >
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-white/10 via-gray-800/15 to-white/8 backdrop-blur-xl rounded-2xl px-6 py-4 border border-white/20 shadow-2xl">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="text-xl font-bold text-white hover:text-purple-300 transition-colors">
              NS
            </Link>
            
            <div className="flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline text-sm font-medium">{item.label}</span>
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