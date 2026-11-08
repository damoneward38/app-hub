import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, UserSession } from '../../types';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessions: UserSession[];
  login: (email: string, password?: string, role?: UserRole) => Promise<boolean>;
  signup: (data: { name: string; email: string; company: string; plan?: 'basic' | 'pro' | 'enterprise' | 'whitelabel'; role?: UserRole }) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updatePlan: (plan: 'basic' | 'pro' | 'enterprise' | 'whitelabel') => void;
  verifyEmail: (code: string) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  completePasswordReset: (token: string, newPassword: string) => Promise<boolean>;
  toggleMfa: (enabled: boolean) => Promise<boolean>;
  revokeSession: (sessionId: string) => void;
  terminateOtherSessions: () => void;
  canAccessModule: (module: 'security_config' | 'alerts_incidents' | 'privacy_governance' | 'full_admin' | 'read_only') => boolean;
  canPerformWriteAction: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const restoreSession = async () => {
      const token = sessionStorage.getItem('skyguard_auth_token');
      if (!token) { if (!cancelled) { setUser(null); setIsLoading(false); } return; }
      try {
        const res = await fetch('/api/auth/session', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Session expired');
        const data = await res.json();
        if (!cancelled && data.authenticated && data.user) setUser(data.user as UserProfile);
        else if (!cancelled) { sessionStorage.removeItem('skyguard_auth_token'); setUser(null); }
      } catch {
        if (!cancelled) { sessionStorage.removeItem('skyguard_auth_token'); setUser(null); }
      } finally { if (!cancelled) setIsLoading(false); }
    };
    void restoreSession();
    return () => { cancelled = true; };
  }, []);

  const login = async (email: string, password?: string, _role?: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      if (!res.ok) { setUser(null); sessionStorage.removeItem('skyguard_auth_token'); return false; }
      const data = await res.json();
      if (!data.success || !data.user || !data.token) { setUser(null); return false; }
      sessionStorage.setItem('skyguard_auth_token', data.token);
      setUser(data.user as UserProfile);
      setSessions([]);
      return true;
    } catch { setUser(null); sessionStorage.removeItem('skyguard_auth_token'); return false; }
    finally { setIsLoading(false); }
  };

  const signup = async (_data: { name: string; email: string; company: string; plan?: 'basic' | 'pro' | 'enterprise' | 'whitelabel'; role?: UserRole }): Promise<boolean> => false;

  const logout = () => {
    const token = sessionStorage.getItem('skyguard_auth_token');
    if (token) void fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    sessionStorage.removeItem('skyguard_auth_token');
    setUser(null); setSessions([]);
  };

  // Roles and plans are server-owned. Browser-side role switching and plan edits are disabled.
  const switchRole = (_role: UserRole) => {};
  const updatePlan = (_plan: 'basic' | 'pro' | 'enterprise' | 'whitelabel') => {};
  const verifyEmail = async (_code: string): Promise<boolean> => false;
  const requestPasswordReset = async (_email: string): Promise<boolean> => false;
  const completePasswordReset = async (_token: string, _newPassword: string): Promise<boolean> => false;
  const toggleMfa = async (_enabled: boolean): Promise<boolean> => false;
  const revokeSession = (_sessionId: string) => {};
  const terminateOtherSessions = () => {};

  // RBAC Permission Engine
  // OWNER: Full access
  // ADMIN: Security configuration
  // SECURITY ANALYST: Alerts, Incidents, Reports
  // PRIVACY OFFICER: GDPR, Consent, Data requests
  // VIEWER: Read-only
  const canAccessModule = (module: 'security_config' | 'alerts_incidents' | 'privacy_governance' | 'full_admin' | 'read_only'): boolean => {
    if (!user) return false;
    const role = user.role;

    if (role === 'owner') return true;

    switch (module) {
      case 'full_admin':
        return false;
      case 'security_config':
        return role === 'admin';
      case 'alerts_incidents':
        return role === 'admin' || role === 'security_analyst' || role === 'security_officer' || role === 'analyst';
      case 'privacy_governance':
        return role === 'admin' || role === 'privacy_officer' || role === 'compliance_auditor';
      case 'read_only':
        return true;
      default:
        return false;
    }
  };

  const canPerformWriteAction = (): boolean => {
    if (!user) return false;
    return user.role !== 'viewer';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        sessions,
        login,
        signup,
        logout,
        switchRole,
        updatePlan,
        verifyEmail,
        requestPasswordReset,
        completePasswordReset,
        toggleMfa,
        revokeSession,
        terminateOtherSessions,
        canAccessModule,
        canPerformWriteAction,
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
