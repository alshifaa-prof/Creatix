import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Profile, UserRole } from '../types';

interface AuthContextType {
  user: Profile | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password?: string) => Promise<void>;
  signUp: (name: string, email: string, password?: string, role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const initSession = async () => {
    try {
      setLoading(true);
      const session = await api.getCurrentSession();
      setUser(session?.user || null);
    } catch (e) {
      console.error('Failed to initialize session:', e);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initSession();
  }, []);

  const signIn = async (email: string, password?: string) => {
    const session = await api.signIn(email, password);
    setUser(session.user);
  };

  const signUp = async (
    name: string,
    email: string,
    password?: string,
    role: UserRole = 'creator'
  ) => {
    const session = await api.signUp(name, email, password, role);
    setUser(session.user);
  };

  const signOut = async () => {
    await api.signOut();
    setUser(null);
  };

  const refreshUser = async () => {
    if (user?.id) {
      const updated = await api.getProfile(user.id);
      if (updated) setUser(updated);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        loading,
        signIn,
        signUp,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
