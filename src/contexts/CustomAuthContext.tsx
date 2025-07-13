
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {useRouter} from 'next/navigation';
import type {User} from 'firebase/auth';
import {
  onAuthChange,
  signIn as firebaseSignIn,
  signUp as firebaseSignUp,
  logout as firebaseSignOut,
  getUserProfileFromRTDB,
  createUserProfileInRTDB,
} from '@/lib/auth';
import type {UserProfile} from '@/lib/types';
import {useToast} from '@/hooks/use-toast';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: User | null;
  isLoading: boolean;
  signIn: (email_param: string, password_param: string) => Promise<boolean>;
  signUp: (
    name_param: string,
    email_param: string,
    password_param: string
  ) => Promise<boolean>;
  signOut: () => void;
  updateUserInContext: (updatedUser: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const CustomAuthProvider = ({children}: {children: ReactNode}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const {toast} = useToast();

  useEffect(() => {
    const unsubscribe = onAuthChange(async userAuth => {
      setIsLoading(true);
      if (userAuth) {
        setFirebaseUser(userAuth);
        try {
          // Fetch user profile from Realtime Database
          const userProfile = await getUserProfileFromRTDB(userAuth.uid);
          if (userProfile) {
            setUser(userProfile);
          } else {
            // This case might happen if DB entry creation failed during signup.
            // We can try to create it again.
            const newProfile = await createUserProfileInRTDB(userAuth);
            setUser(newProfile);
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          setUser(null); // Or handle error appropriately
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
          throw new Error(data.error || 'Sign-in failed');
      }
      toast({title: 'Signed In!', description: 'Welcome back!'});
      // The onAuthChange listener will handle setting user state, but we can force a re-check
      // Or rely on the cookie being set and a page reload. A router.refresh() might be good here.
      router.refresh(); 
      return true;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign In Error',
        description: error.message,
      });
      setIsLoading(false);
      return false;
    }
  };

  const signUp = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ name, email, password }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Sign-up failed');
        }
        toast({
            title: 'Account Created!',
            description: 'Welcome to TrekConnect! Please complete your profile.',
        });
        // onAuthChange will handle the rest.
        router.refresh();
        return true;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign Up Error',
        description: error.message,
      });
      setIsLoading(false);
      return false;
    }
  };

  const signOut = async () => {
    try {
      // Call the server endpoint to clear the HttpOnly cookie
      await fetch('/api/auth/logout', { method: 'POST' });
      // Sign out from Firebase client-side
      await firebaseSignOut();
      setUser(null);
      setFirebaseUser(null);
      // Redirect to sign-in page
      router.push('/auth/signin');
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign Out Failed',
        description: error.message,
      });
    }
  };

  const updateUserInContext = (updatedUser: UserProfile) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoading,
        signIn,
        signUp,
        signOut,
        updateUserInContext,
      }}
    >
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
