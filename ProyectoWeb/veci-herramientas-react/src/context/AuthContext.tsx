import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import keycloak from '../keycloak';

interface User {
  userId: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function buildUserFromToken(): User | null {
  if (!keycloak.authenticated || !keycloak.tokenParsed) return null;
  const p = keycloak.tokenParsed as any;
  const roles: string[] = p.resource_access?.['veci-herramientas']?.roles ?? p.realm_access?.roles ?? [];
  return {
    userId: p.sub,
    email: p.email ?? '',
    name: p.preferred_username ?? p.name ?? p.email ?? '',
    role: roles.includes('admin') ? 'admin' : 'user',
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => buildUserFromToken());
  const [loading, setLoading] = useState(!keycloak.authenticated && !keycloak.authServerUrl);

  useEffect(() => {
    setUser(buildUserFromToken());
    setLoading(false);

    const onAuthSuccess = () => setUser(buildUserFromToken());
    const onAuthLogout = () => setUser(null);
    const onTokenExpired = () => {
      keycloak.updateToken(30).then((refreshed) => {
        if (refreshed) setUser(buildUserFromToken());
      }).catch(() => {
        setUser(null);
      });
    };

    keycloak.onAuthSuccess = onAuthSuccess;
    keycloak.onAuthLogout = onAuthLogout;
    keycloak.onTokenExpired = onTokenExpired;

    return () => {
      keycloak.onAuthSuccess = undefined;
      keycloak.onAuthLogout = undefined;
      keycloak.onTokenExpired = undefined;
    };
  }, []);

  const login = useCallback(() => {
    keycloak.login({ redirectUri: window.location.origin + '/dashboard' });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    keycloak.logout({ redirectUri: window.location.origin + '/login' });
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token: keycloak.token ?? null,
      isAuthenticated: keycloak.authenticated ?? false,
      isAdmin: user?.role === 'admin',
      loading,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
};
