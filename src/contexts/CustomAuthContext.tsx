
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
import { auth } from '@/lib/firebase'; // Correctly import auth from firebase
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
  signOut: () => Promise<void>;
  updateUserInContext: (updatedUser: UserProfile) => void;
  validateSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const CustomAuthProvider = ({children}: {children: ReactNode}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const {toast} = useToast();

  const handleAuthChange = async (userAuth: User | null) => {
    if (userAuth) {
      setFirebaseUser(userAuth);
      try {
        const userProfile = await getUserProfileFromRTDB(userAuth.uid);
        if (userProfile) {
          setUser(userProfile);
        } else {
          // This case handles a user who authenticated but doesn't have a DB profile yet.
          // This can happen if the signup process was interrupted.
          const newProfile = await createUserProfileInRTDB(userAuth);
          setUser(newProfile);
        }
      } catch (error) {
        console.error('Failed to fetch or create user profile:', error);
        // Signing out to prevent being in a broken state
        await firebaseSignOut();
        setUser(null);
        setFirebaseUser(null);
      }
    } else {
      setFirebaseUser(null);
      setUser(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onAuthChange(handleAuthChange);
    return () => {
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await firebaseSignIn(email, password);
      // The onAuthChange listener will handle setting user state and loading state.
      toast({title: 'Signed In!', description: 'Welcome back!'});
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
      await firebaseSignUp(name, email, password);
      // The onAuthChange listener will handle setting the new user's state.
      toast({
        title: 'Account Created!',
        description: 'Welcome to TrekConnect! Please complete your profile.',
      });
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
      await firebaseSignOut();
      // onAuthChange will clear user state.
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

  const validateSession = async () => {
    setIsLoading(true);
    try {
      const currentUser = auth.currentUser;
      await handleAuthChange(currentUser);
    } catch (error) {
      console.error('Error during session validation:', error);
    } finally {
        setIsLoading(false);
    }
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
        validateSession,
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
