import { motion } from 'framer-motion';
import { Eye, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function GuestViewBanner() {
  const { isAuthenticated, isGuestViewMode, toggleGuestView } = useAuth();

  // Only show when authenticated AND in guest view mode
  if (!isAuthenticated || !isGuestViewMode) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-0 left-0 right-0 z-[100] flex justify-center pt-2 px-4 pointer-events-none"
    >
      <div className="bg-amber-500/90 backdrop-blur-sm rounded-full px-4 py-1.5 shadow-lg border border-amber-400/50 pointer-events-auto flex items-center gap-2">
        <Eye className="w-4 h-4 text-amber-900" />
        <span className="text-sm font-medium text-amber-900">Viewing as Guest</span>
        <button
          onClick={toggleGuestView}
          className="ml-1 p-1 hover:bg-amber-600/30 rounded-full transition-colors"
          title="Exit Guest View"
        >
          <X className="w-3 h-3 text-amber-900" />
        </button>
      </div>
    </motion.div>
  );
}
