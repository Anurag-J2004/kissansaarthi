import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type UserRole = 'FARMER' | 'OFFICER' | 'ADMIN' | 'SUPERVISOR' | 'OPERATOR' | null;

export interface AuthUser {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  panchayat?: string;
  panchayat_name?: string;
  block?: string;
  district?: string;
  language?: string;
  sms_alerts?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (user: AuthUser, token?: string) => void;
  updateUser: (partial: Partial<AuthUser>) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null, token: null,
  login: () => {}, updateUser: () => {}, logout: () => {},
  isAuthenticated: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]   = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Restore session from localStorage on page reload
  useEffect(() => {
    const savedToken = localStorage.getItem('km_token');
    const savedUser  = localStorage.getItem('km_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {}
    }
  }, []);

  const login = (u: AuthUser, t?: string) => {
    setUser(u);
    if (t) {
      setToken(t);
      localStorage.setItem('km_token', t);
    }
    localStorage.setItem('km_user', JSON.stringify(u));
  };

  const updateUser = (partial: Partial<AuthUser>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      localStorage.setItem('km_user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('km_token');
    localStorage.removeItem('km_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, updateUser, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
