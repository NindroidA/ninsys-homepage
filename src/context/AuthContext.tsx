import { createContext, useCallback, useEffect, useState, ReactNode } from 'react';
import { AuthContextValue, AuthState, LoginResponse } from '../types/auth';
import { API_BASE } from '../utils/goveeAPI';

// Dev mode check - allows bypassing auth on localhost
export const IS_DEV = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const STORAGE_KEYS = {
  TOKEN: 'ninsys_auth_token',
  EXPIRES: 'ninsys_auth_expires',
  GUEST_VIEW: 'ninsys_guest_view_mode',
} as const;

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  isGuestViewMode: false,
  token: null,
  expiresAt: null,
};

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(initialState);

  // Check if session is valid
  const checkSession = useCallback((): boolean => {
    const token = sessionStorage.getItem(STORAGE_KEYS.TOKEN);
    const expires = sessionStorage.getItem(STORAGE_KEYS.EXPIRES);

    if (!token || !expires) return false;

    const expiresAt = new Date(expires);
    return expiresAt.getTime() > Date.now();
  }, []);

  // Initialize state from storage on mount
  useEffect(() => {
    const token = sessionStorage.getItem(STORAGE_KEYS.TOKEN);
    const expires = sessionStorage.getItem(STORAGE_KEYS.EXPIRES);
    const guestView = localStorage.getItem(STORAGE_KEYS.GUEST_VIEW) === 'true';

    if (token && expires) {
      const expiresAt = new Date(expires);
      if (expiresAt.getTime() > Date.now()) {
        setState({
          isAuthenticated: true,
          user: 'admin',
          isGuestViewMode: guestView,
          token,
          expiresAt,
        });
      } else {
        // Clear expired session
        sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
        sessionStorage.removeItem(STORAGE_KEYS.EXPIRES);
      }
    }
  }, []);

  // Login with TOTP code
  const login = useCallback(async (totpCode: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE}/v2/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: totpCode }),
      });

      const data: LoginResponse = await response.json();

      if (data.success && data.data) {
        const { token, expires, user } = data.data;
        const expiresAt = new Date(expires);

        sessionStorage.setItem(STORAGE_KEYS.TOKEN, token);
        sessionStorage.setItem(STORAGE_KEYS.EXPIRES, expires);

        setState({
          isAuthenticated: true,
          user,
          isGuestViewMode: false,
          token,
          expiresAt,
        });

        // Clear guest view mode on login
        localStorage.removeItem(STORAGE_KEYS.GUEST_VIEW);

        return { success: true };
      }

      return { success: false, error: data.error || 'Authentication failed' };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }, []);

  // Logout
  const logout = useCallback(async (): Promise<void> => {
    try {
      const token = sessionStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token) {
        await fetch(`${API_BASE}/v2/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.warn('Logout API call failed:', error);
    }

    // Clear storage regardless of API result
    sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.EXPIRES);
    localStorage.removeItem(STORAGE_KEYS.GUEST_VIEW);

    setState(initialState);
  }, []);

  // Toggle guest view mode
  const toggleGuestView = useCallback(() => {
    setState((prev) => {
      const newGuestView = !prev.isGuestViewMode;
      if (newGuestView) {
        localStorage.setItem(STORAGE_KEYS.GUEST_VIEW, 'true');
      } else {
        localStorage.removeItem(STORAGE_KEYS.GUEST_VIEW);
      }
      return { ...prev, isGuestViewMode: newGuestView };
    });
  }, []);

  // Dev mode login bypass - instant auth without backend
  const devLogin = useCallback((): void => {
    if (!IS_DEV) {
      console.warn('devLogin is only available in development mode');
      return;
    }

    // Create a fake token that expires in 24 hours
    const fakeToken = 'dev_token_' + Date.now();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    sessionStorage.setItem(STORAGE_KEYS.TOKEN, fakeToken);
    sessionStorage.setItem(STORAGE_KEYS.EXPIRES, expiresAt.toISOString());

    setState({
      isAuthenticated: true,
      user: 'dev_admin',
      isGuestViewMode: false,
      token: fakeToken,
      expiresAt,
    });

    localStorage.removeItem(STORAGE_KEYS.GUEST_VIEW);
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    toggleGuestView,
    checkSession,
    devLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
