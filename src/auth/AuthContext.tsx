import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi } from '../api/modules/authApi';
import { AUTH_INVALIDATED_EVENT } from '../constants';
import type { AuthenticatedUser, RoleCode } from '../types';
import { authSession } from '../utils/authSession';

export interface AuthContextValue {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isInRole: (...roles: RoleCode[]) => boolean;
}

// The context is exported so the small useAuth hook can remain independently reusable.
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialSession] = useState(() => authSession.read());
  const [user, setUser] = useState<AuthenticatedUser | null>(initialSession?.user ?? null);
  const [isLoading, setIsLoading] = useState(Boolean(initialSession));

  const logout = useCallback(() => {
    authSession.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    const handleInvalidated = () => setUser(null);
    window.addEventListener(AUTH_INVALIDATED_EVENT, handleInvalidated);
    return () => window.removeEventListener(AUTH_INVALIDATED_EVENT, handleInvalidated);
  }, []);

  useEffect(() => {
    if (!initialSession) return;
    authApi.me()
      .then(current => setUser({ ...initialSession.user, ...current }))
      .catch(logout)
      .finally(() => setIsLoading(false));
  }, [initialSession, logout]); // Validate the persisted token once when the application loads.

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login(email, password);
    authSession.write(result);
    setUser(result.user);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    logout,
    isInRole: (...roles) => Boolean(user?.roles.some(role => roles.includes(role))),
  }), [user, isLoading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
