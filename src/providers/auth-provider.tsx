'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  rol?: string;
  empleadoId?: number;
}

interface AuthContextType {
  user: User | null;
  profile: any | null; // For compatibility with existing code
  loading: boolean;
  isUserLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check local storage for existing session on mount
    const token = localStorage.getItem('zyra_token');
    const userDataStr = localStorage.getItem('zyra_user');

    if (token && userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        setUser(userData);
      } catch (e) {
        console.error('Failed to parse user data from local storage', e);
        localStorage.removeItem('zyra_token');
        localStorage.removeItem('zyra_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('zyra_token', token);
    localStorage.setItem('zyra_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('zyra_token');
    localStorage.removeItem('zyra_user');
    setUser(null);
    router.push('/login');
  };

  const getToken = () => {
    return typeof window !== 'undefined' ? localStorage.getItem('zyra_token') : null;
  };

  const contextValue: AuthContextType = {
    user,
    profile: user ? { ...user, nombre: user.displayName } : null,
    loading,
    isUserLoading: loading,
    login,
    logout,
    getToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
