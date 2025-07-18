
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, Loader2, MountainSnow } from 'lucide-react'
import { SiteLogo } from '@/components/SiteLogo'
import { useToast } from '@/hooks/use-toast'
import { useCustomAuth } from '@/contexts/CustomAuthContext'
import Image from 'next/image'

export default function SignUpPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { signUp: customSignUp, isLoading: authIsLoading, user } = useCustomAuth();
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // If user is already logged in, redirect them
  useEffect(() => {
    if (user && !authIsLoading) {
      router.push('/profile/edit'); // New users should edit their profile
    }
  }, [user, authIsLoading, router]);


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
    if (password.length < 6) {
        toast({ variant: 'destructive', title: 'Error', description: 'Password must be at least 6 characters.' });
        return;
    }

    setIsSubmitting(true)
    const success = await customSignUp(fullName, email, password);
    if (success) {
      router.push('/profile/edit'); // Redirect to edit profile page after successful signup
    }
    // Error toasts are handled within customSignUp (AuthContext)
    setIsSubmitting(false)
  }

  if (authIsLoading || user) {
      return (
          <div className="flex min-h-screen flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
      )
  }

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="hidden bg-muted lg:block relative">
        <Image
          src="https://placehold.co/1200x800.png"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          data-ai-hint="himalayan valley"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute top-8 left-8 text-white">
             <div className="flex items-center gap-2 text-2xl font-semibold font-headline text-white">
              <MountainSnow className="h-8 w-8" />
              <span>TrekConnect</span>
            </div>
            <p className="mt-2 text-lg">Your adventure starts here. Join a community of explorers.</p>
        </div>
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold font-headline">Sign Up</h1>
            <p className="text-balance text-muted-foreground">
              Enter your information to create an account
            </p>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4">
             <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Max Robinson"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isSubmitting || authIsLoading}
                />
              </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting || authIsLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password (min. 6 characters)"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting || authIsLoading}
              />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting || authIsLoading}
                />
              </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || authIsLoading}>
               {(isSubmitting || authIsLoading) ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-5 w-5" />
              )}
              Create an account
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/signin" className="underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
