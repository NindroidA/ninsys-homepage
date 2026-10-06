import { Eye, EyeOff, KeyRound, LayoutDashboard, LogOut } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

// The dialog, and the framer-motion it animates with, loads on first open, so the footer
// on every public page doesn't pull motion into the critical path.
const AdminLoginModal = lazy(() =>
  import("./AdminLoginModal").then((m) => ({ default: m.AdminLoginModal })),
);

interface AdminLoginButtonProps {
  variant?: "subtle" | "prominent";
}

export function AdminLoginButton({ variant = "subtle" }: AdminLoginButtonProps) {
  const { isAuthenticated, isGuestViewMode, toggleGuestView, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Stays mounted after the first open so AnimatePresence can play the close animation.
  const [modalLoaded, setModalLoaded] = useState(false);
  const navigate = useNavigate();

  // Logging in from the footer used to leave you authenticated on the public page
  // with no route to /admin anywhere in the UI.
  const goToAdmin = () => navigate("/admin");

  const openModal = () => {
    setModalLoaded(true);
    setIsModalOpen(true);
  };

  const modal = modalLoaded && (
    <Suspense fallback={null}>
      <AdminLoginModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={goToAdmin}
      />
    </Suspense>
  );

  if (!isAuthenticated) {
    // Not logged in - show login button
    if (variant === "subtle") {
      return (
        <>
          <button
            type="button"
            onClick={openModal}
            className="p-2 text-white/20 hover:text-white/40 hover:bg-white/5 rounded-lg transition-all duration-300"
            title="Admin Login"
          >
            <KeyRound className="w-4 h-4" />
          </button>
          {modal}
        </>
      );
    }

    return (
      <>
        <button
          type="button"
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300"
        >
          <KeyRound className="w-4 h-4" />
          <span className="text-sm font-medium">Login</span>
        </button>
        {modal}
      </>
    );
  }

  // Logged in - show admin controls
  return (
    <div className="flex items-center gap-2">
      {/* Admin Panel */}
      <button
        type="button"
        onClick={goToAdmin}
        className="rounded-lg p-2 text-white/40 transition-all duration-300 hover:bg-white/10 hover:text-white/70"
        title="Admin Panel"
        aria-label="Open admin panel"
      >
        <LayoutDashboard className="h-4 w-4" />
      </button>

      {/* Guest View Toggle */}
      <button
        type="button"
        onClick={toggleGuestView}
        className={`p-2 rounded-lg transition-all duration-300 ${
          isGuestViewMode
            ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
            : "text-white/40 hover:text-white/60 hover:bg-white/10"
        }`}
        title={isGuestViewMode ? "Exit Guest View" : "View as Guest"}
      >
        {isGuestViewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>

      {/* Logout Button */}
      <button
        type="button"
        onClick={logout}
        className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300"
        title="Logout"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
