import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthUser } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  token: string | null;
  signIn: (email: string, password?: string, role?: string) => Promise<boolean>;
  signInAsRootAdmin: () => Promise<boolean>;
  signOut: () => Promise<void>;
  isSignInModalOpen: boolean;
  setIsSignInModalOpen: (open: boolean) => void;
  openSignInModal: () => void;
  closeSignInModal: () => void;
}

const ROOT_ADMIN_EMAIL = 'damoneward38@gmail.com';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState<boolean>(false);

  // Sync session with backend
  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedToken = localStorage.getItem('magen_auth_token');
        const res = await fetch('/api/auth/session', {
          headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user && storedToken) {
            setUser(data.user);
            setToken(storedToken);
          } else {
            setUser(null); setToken(null);
            localStorage.removeItem('magen_auth_user'); localStorage.removeItem('magen_auth_token');
          }
        } else {
          setUser(null); setToken(null);
          localStorage.removeItem('magen_auth_user'); localStorage.removeItem('magen_auth_token');
        }
      } catch (err) {
        setUser(null); setToken(null);
        localStorage.removeItem('magen_auth_user'); localStorage.removeItem('magen_auth_token');
      }
    };
    checkSession();
  }, []);

  const signIn = async (email: string, password?: string, role?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error('Login failed');
      }

      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('magen_auth_user', JSON.stringify(data.user));
        localStorage.setItem('magen_auth_token', data.token);
        setIsSignInModalOpen(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Sign-in failed; no local fallback is permitted:', error);
      setUser(null); setToken(null);
      localStorage.removeItem('magen_auth_user'); localStorage.removeItem('magen_auth_token');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signInAsRootAdmin = async (): Promise<boolean> => false;

  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ token }),
        }).catch(() => {});
      }
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('magen_auth_user');
      localStorage.removeItem('magen_auth_token');
      setIsLoading(false);
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'SUPERADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isLoading,
        token,
        signIn,
        signInAsRootAdmin,
        signOut,
        isSignInModalOpen,
        setIsSignInModalOpen,
        openSignInModal: () => setIsSignInModalOpen(true),
        closeSignInModal: () => setIsSignInModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
