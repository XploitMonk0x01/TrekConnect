
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Loader2 } from 'lucide-react';
import { SiteLogo } from '@/components/SiteLogo';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile, type UserCredential } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { upsertUserFromFirebase } from '@/services/users';

export default function SignUpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSuccessfulSignUp = async (userCredential: UserCredential, isEmailSignUp: boolean = false) => {
    let firebaseUserToUpsert = userCredential.user;

    if (!firebaseUserToUpsert) {
        toast({ variant: 'destructive', title: 'Sign Up Error', description: 'User data not found after sign up.' });
        return;
    }
    
    if (isEmailSignUp && fullName) {
      try {
        await updateProfile(firebaseUserToUpsert, { displayName: fullName });
        // After updating profile, Firebase Auth currentUser should reflect this change.
        // Re-assign to ensure the most up-to-date user object is used for upsert.
        if (auth.currentUser) {
            firebaseUserToUpsert = auth.currentUser;
        }
      } catch (profileError: any) {
          console.error('Error updating Firebase profile:', profileError);
          toast({ variant: 'destructive', title: 'Profile Update Failed', description: 'Could not set your display name in Firebase.' });
          // Proceed with upserting to MongoDB anyway, but the name might be missing from Firebase initially
      }
    }

    const userProfile = await upsertUserFromFirebase(firebaseUserToUpsert);
    if (!userProfile) {
       toast({ 
           variant: 'destructive', 
           title: 'Profile Creation Failed', 
           description: 'Could not save your profile to our database. You are signed in, but some features might not work correctly. Please try editing your profile later or contact support.' 
        });
       // Allow login to proceed but warn the user.
    }
    
    toast({ title: 'Account Created', description: 'Welcome to TrekConnect!' });
    router.push('/'); // Redirect to dashboard
  };

  const handleEmailSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Sign Up Failed', description: 'Passwords do not match.' });
      return;
    }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await handleSuccessfulSignUp(userCredential, true);
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({ variant: 'destructive', title: 'Sign Up Failed', description: error.message || 'Could not create account.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      await handleSuccessfulSignUp(userCredential, false); 
    } catch (error: any) {
      console.error('Google sign up error:', error);
      toast({ variant: 'destructive', title: 'Google Sign Up Failed', description: error.message || 'Could not sign up with Google.' });
    } finally {
      setIsGoogleLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="inline-block mx-auto mb-4">
            <SiteLogo />
          </div>
          <CardTitle className="text-3xl font-headline">Join TrekConnect</CardTitle>
          <CardDescription>Create your account and start your journey with fellow adventurers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" type="text" placeholder="Your Name" required value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={isLoading || isGoogleLoading}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading || isGoogleLoading}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Create a strong password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading || isGoogleLoading}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" placeholder="Confirm your password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading || isGoogleLoading}/>
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading || isGoogleLoading}>
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UserPlus className="mr-2 h-5 w-5" />}
              Create Account
            </Button>
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or sign up with
              </span>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleGoogleSignUp} disabled={isLoading || isGoogleLoading}>
             {isGoogleLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> :
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 112.8 512 0 398.9 0 256S112.8 0 244 0c71.8 0 130.3 29.2 172.9 73.4l-65.3 64.2C335.5 111.3 294.8 88 244 88c-81.1 0-146.9 65.8-146.9 146.9s65.8 146.9 146.9 146.9c104.4 0 132.1-72.7 134.7-109.7H244V261.8h244z"></path></svg>
            }
            Sign up with Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/signin" className="font-semibold text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
