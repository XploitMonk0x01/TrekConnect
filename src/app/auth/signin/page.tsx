
'use client'

import Link from 'next/link'
// import { useRouter } from 'next/navigation' // Keep if needed for custom auth redirect
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
import { useToast } from '@/components/ui/use-toast'
// Removed: useAuth, signIn (Firebase service), z, signInSchema

export default function SignInPage() {
  // const router = useRouter() // Keep if needed for custom auth redirect
  const { toast } = useToast()
  // const { setUser } = useAuth() // Removed
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    // Placeholder for custom MongoDB sign-in logic
    // This will involve calling your /api/auth/signin endpoint
    // which uses bcrypt and generates a JWT.
    console.log('Custom sign-in attempt with:', { email, password });
    toast({
      title: 'Sign In (Custom)',
      description: 'Sign-in logic with MongoDB needs to be implemented.',
    });
    // Example:
    // try {
    //   const response = await fetch('/api/auth/signin', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email, password }),
    //   });
    //   const data = await response.json();
    //   if (!response.ok) throw new Error(data.error || 'Sign-in failed');
    //   localStorage.setItem('customAuthToken', data.token); // Store custom token
    //   // Update custom auth context with user data
    //   // router.push('/profile');
    // } catch (error: any) {
    //   toast({ variant: 'destructive', title: 'Sign In Error', description: error.message });
    // }
    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-primary/10 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-headline">
            Sign In to TrekConnect
          </CardTitle>
          <CardDescription>
            Enter your credentials to continue your adventure.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {/* <Link href="#" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link> */}
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/signup"
              className="font-semibold text-primary hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
