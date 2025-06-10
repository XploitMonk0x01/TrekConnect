
'use client'

import Link from 'next/link'
// import { useRouter } from 'next/navigation' // Keep if needed
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, Loader2 } from 'lucide-react'
import { SiteLogo } from '@/components/SiteLogo'
import { useToast } from '@/components/ui/use-toast'
// Removed: useAuth, signUp (Firebase service), auth (Firebase), GoogleAuthProvider, signInWithPopup, googleSignIn (Firebase service)

export default function SignUpPage() {
  // const router = useRouter() // Keep if needed
  const { toast } = useToast()
  // const { setUser } = useAuth() // Removed
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  // const [isGoogleLoading, setIsGoogleLoading] = useState(false) // Removed Google Sign-Up logic for now

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName || !email || !password || !confirmPassword) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please fill in all fields.' });
      return
    }
    if (password !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Error', description: 'Passwords do not match.' });
      return
    }

    setIsLoading(true)
    // Placeholder for custom MongoDB sign-up logic
    // This will involve calling your /api/auth/signup endpoint.
    console.log('Custom sign-up attempt with:', { fullName, email, password });
    toast({
      title: 'Sign Up (Custom)',
      description: 'Sign-up logic with MongoDB needs to be implemented.',
    });
    // Example:
    // try {
    //   const response = await fetch('/api/auth/signup', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email, password, name: fullName }),
    //   });
    //   const data = await response.json();
    //   if (!response.ok) throw new Error(data.error || 'Sign-up failed');
    //   localStorage.setItem('customAuthToken', data.token); // Store custom token
    //   // Update custom auth context with user data
    //   // router.push('/profile/edit');
    // } catch (error: any) {
    //   toast({ variant: 'destructive', title: 'Sign Up Error', description: error.message });
    // }
    setIsLoading(false)
  }

  // Removed handleGoogleSignUp

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="inline-block mx-auto mb-4">
            <SiteLogo />
          </div>
          <CardTitle className="text-3xl font-headline">
            Join TrekConnect
          </CardTitle>
          <CardDescription>
            Create your account and start your journey.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Your Name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-5 w-5" />
              )}
              Create Account
            </Button>
          </form>
          {/* Google Sign-Up button removed
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
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignUp}
            disabled={isLoading || isGoogleLoading}
          >
            Google SVG or Icon
            Sign up with Google
          </Button>
          */}
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/auth/signin"
              className="font-semibold text-primary hover:underline"
            >
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
