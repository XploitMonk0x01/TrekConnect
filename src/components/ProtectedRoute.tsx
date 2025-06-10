'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/use-toast'

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, error } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!loading && !user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description:
          (typeof error === 'string' ? error : error?.message) ||
          'Please sign in to access this page.',
      })
      router.push('/auth/signin')
    }
  }, [user, loading, error, router, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
