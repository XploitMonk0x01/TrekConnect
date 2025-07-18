
'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { useCustomAuth } from '@/contexts/CustomAuthContext'
import { Loader2, MountainSnow } from 'lucide-react'
import Image from 'next/image'

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn: customSignIn, isLoading: authIsLoading, user } = useCustomAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectTo = searchParams.get('redirect') || '/'

  // If user is already logged in, redirect them
  useEffect(() => {
    if (user && !authIsLoading) {
      router.push(redirectTo)
    }
  }, [user, authIsLoading, router, redirectTo])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const success = await customSignIn(email, password)
    if (success) {
      router.push(redirectTo)
    }
    // Error toasts are handled within customSignIn (AuthContext)
    setIsSubmitting(false)
  }

  // Prevent flash of sign-in form if loading or already logged in
  if (authIsLoading || user) {
      return (
          <div className="flex min-h-screen flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
      )
  }

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
             <h1 className="text-3xl font-bold font-headline">Sign In</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4">
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
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                 value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting || authIsLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || authIsLoading}>
               {isSubmitting || authIsLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block relative">
        <Image
          src="https://placehold.co/1200x800.png"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          data-ai-hint="mountain landscape"
        />
         <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-8 left-8 text-white">
            <div className="flex items-center gap-2 text-2xl font-semibold font-headline text-white">
              <MountainSnow className="h-8 w-8" />
              <span>TrekConnect</span>
            </div>
            <p className="mt-2 text-lg">Your adventure starts here. Join a community of explorers.</p>
        </div>
      </div>
    </div>
  )
}
