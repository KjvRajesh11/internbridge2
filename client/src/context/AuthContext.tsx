import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

interface AuthContextType {
  user: any | null;
  company: any | null;
  role: 'student' | 'recruiter' | 'admin';
  loading: boolean;
  availableProfiles: any[];
  activeUserId: string;
  switchPersona: (userId: string) => Promise<void>;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [company, setCompany] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [availableProfiles, setAvailableProfiles] = useState<any[]>([]);
  const [activeUserId, setActiveUserId] = useState<string>(() => api.getDemoUser());

  const loadUserData = async () => {
    try {
      setLoading(true);
      const res = await api.getMe();
      if (res.success) {
        setUser(res.user);
        setCompany(res.company);
        setAvailableProfiles(res.availableProfiles || []);
        setActiveUserId(res.user.id);
      }
    } catch (err) {
      console.error('Failed to load user auth context:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const switchPersona = async (userId: string) => {
    try {
      setLoading(true);
      await api.switchUser(userId);
      setActiveUserId(userId);
      await loadUserData();
    } catch (err) {
      console.error('Failed to switch persona:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string) => {
    await api.login(email);
    await loadUserData();
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setCompany(null);
  };

  const role = (user?.role as 'student' | 'recruiter' | 'admin') || 'student';

  return (
    <AuthContext.Provider
      value={{
        user,
        company,
        role,
        loading,
        availableProfiles,
        activeUserId,
        switchPersona,
        login,
        logout,
        refreshAuth: loadUserData,
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
