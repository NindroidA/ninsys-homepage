export interface AuthState {
  isAuthenticated: boolean;
  user: string | null;
  isGuestViewMode: boolean;
  token: string | null;
  expiresAt: Date | null;
}

export interface AuthContextValue extends AuthState {
  login: (totpCode: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  toggleGuestView: () => void;
  checkSession: () => boolean;
  devLogin: () => void;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    token: string;
    expires: string;
    user: string;
  };
  error?: string;
}
