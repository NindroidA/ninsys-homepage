import { KeyRound, Eye, EyeOff, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AdminLoginModal } from './AdminLoginModal';

interface AdminLoginButtonProps {
  variant?: 'subtle' | 'prominent';
}

export function AdminLoginButton({ variant = 'subtle' }: AdminLoginButtonProps) {
  const { isAuthenticated, isGuestViewMode, toggleGuestView, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!isAuthenticated) {
    // Not logged in - show login button
    if (variant === 'subtle') {
      return (
        <>
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-2 text-white/20 hover:text-white/40 hover:bg-white/5 rounded-lg transition-all duration-300"
            title="Admin Login"
          >
            <KeyRound className="w-4 h-4" />
          </button>
          <AdminLoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
      );
    }

    return (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300"
        >
          <KeyRound className="w-4 h-4" />
          <span className="text-sm font-medium">Login</span>
        </button>
        <AdminLoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  // Logged in - show admin controls
  return (
    <div className="flex items-center gap-2">
      {/* Guest View Toggle */}
      <button
        onClick={toggleGuestView}
        className={`p-2 rounded-lg transition-all duration-300 ${
          isGuestViewMode
            ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
            : 'text-white/40 hover:text-white/60 hover:bg-white/10'
        }`}
        title={isGuestViewMode ? 'Exit Guest View' : 'View as Guest'}
      >
        {isGuestViewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>

      {/* Logout Button */}
      <button
        onClick={logout}
        className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300"
        title="Logout"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
