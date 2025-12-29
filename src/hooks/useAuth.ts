import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AuthContextValue } from '../types/auth';

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

/**
 * Hook to check if admin features should be visible
 * Returns true only when authenticated AND not in guest view mode
 */
export function useAdminVisible(): boolean {
  const { isAuthenticated, isGuestViewMode } = useAuth();
  return isAuthenticated && !isGuestViewMode;
}
