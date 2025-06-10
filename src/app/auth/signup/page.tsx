'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
import { useAuth } from '@/contexts/AuthContext'
import { signUp } from '@/services/auth/auth.service'
import { auth } from '@/lib/firebase'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
// import { googleSignIn } from '@/services/auth/google.service'

export default function SignUpPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { setUser } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName || !email || !password || !confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all fields.',
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Passwords do not match.',
      })
      return
    }

    setIsLoading(true)

    try {
      const { user, token } = await signUp(email, password, fullName)
      localStorage.setItem('authToken', token)
      setUser(user)
      toast({ title: 'Success', description: 'Account created successfully!' })
      router.push('/profile/edit')
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign Up Error',
        description: error.message || 'An error occurred during sign up.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true)
    try {
      // Initialize firebase auth here if not already done
      const result = await signInWithPopup(auth, new GoogleAuthProvider())
      const googleUser = {
        email: result.user.email!,
        name: result.user.displayName!,
        picture: result.user.photoURL,
      }

      const { user, token } = await googleSignIn(googleUser)
      localStorage.setItem('authToken', token)
      setUser(user)
      toast({ title: 'Success', description: 'Signed in successfully!' })
      router.push('/profile/edit')
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Google Sign In Error',
        description:
          error.message || 'An error occurred during Google sign in.',
      })
    } finally {
      setIsGoogleLoading(false)
    }
  }

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
            Create your account and start your journey with fellow adventurers.
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
                disabled={isLoading || isGoogleLoading}
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
                disabled={isLoading || isGoogleLoading}
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
                disabled={isLoading || isGoogleLoading}
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
                disabled={isLoading || isGoogleLoading}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90"
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-5 w-5" />
              )}
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
          {/* google Provider */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignUp}
            disabled={isLoading || isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <svg
                className="mr-2 h-4 w-4"
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="google"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 488 512"
              >
                <path
                  fill="currentColor"
                  d="M488 261.8C488 403.3 381.5 512 244 512 112.8 512 0 398.9 0 256S112.8 0 244 0c71.8 0 130.3 29.2 172.9 73.4l-65.3 64.2C335.5 111.3 294.8 88 244 88c-81.1 0-146.9 65.8-146.9 146.9s65.8 146.9 146.9 146.9c104.4 0 132.1-72.7 134.7-109.7H244V261.8h244z"
                ></path>
              </svg>
            )}
            Sign up with Google
          </Button>
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
