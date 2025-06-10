
'use client';

import type { UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email_param: string, password_param: string) => Promise<boolean>;
  signUp: (name_param: string, email_param: string, password_param: string) => Promise<boolean>;
  signOut: () => void;
  validateSession: () => Promise<void>;
  updateUserInContext: (updatedUser: UserProfile) => void; // New function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const CustomAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        setToken(storedToken);
        try {
          const response = await fetch('/api/auth/validate', {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          if (response.ok) {
            const userData: UserProfile = await response.json();
            setUser(userData);
          } else {
            localStorage.removeItem('authToken');
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          console.error('Session validation error:', error);
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  const signIn = async (email_param: string, password_param: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email_param, password: password_param }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Sign-in failed');
      }
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('authToken', data.token);
      setIsLoading(false);
      return true;
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Sign In Error', description: error.message });
      setIsLoading(false);
      return false;
    }
  };

  const signUp = async (name_param: string, email_param: string, password_param: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name_param, email: email_param, password: password_param }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Sign-up failed');
      }
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('authToken', data.token);
      setIsLoading(false);
      return true;
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Sign Up Error', description: error.message });
      setIsLoading(false);
      return false;
    }
  };

  const signOut = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    router.push('/auth/signin'); 
  };
  
  const validateSession = async () => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) { 
      setIsLoading(true);
      try {
        const response = await fetch('/api/auth/validate', {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        if (response.ok) {
          const userData: UserProfile = await response.json();
          setUser(userData);
          setToken(storedToken); 
        } else {
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Manual session validation error:', error);
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
      }
      setIsLoading(false);
    } else if (!user && !token) { 
        setUser(null);
        setToken(null);
        setIsLoading(false); 
    } else {
        setIsLoading(false); 
    }
  };

  const updateUserInContext = (updatedUser: UserProfile) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signUp, signOut, validateSession, updateUserInContext }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useCustomAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useCustomAuth must be used within an AuthProvider');
  }
  return context;
};
