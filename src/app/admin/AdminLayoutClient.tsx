'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Mountain,
  LayoutDashboard,
  MapPin,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface AdminLayoutClientProps {
  children: React.ReactNode
}

const adminNavItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Destinations',
    href: '/admin/destinations',
    icon: MapPin,
  },
]

export default function AdminLayoutClient({
  children,
}: AdminLayoutClientProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/session', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        })
        const data = await res.json()
        setIsAuthenticated(data.authenticated)
      } catch {
        setIsAuthenticated(false)
      }
    }
    checkAuth()
  }, [pathname])

  // Redirect to login if not authenticated (except on login page)
  useEffect(() => {
    if (isAuthenticated === false && pathname !== '/admin/login') {
      router.push('/admin/login')
    }
  }, [isAuthenticated, pathname, router])

  // If on login page, just render children (the login form)
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Shield className="h-5 w-5 animate-pulse" />
          <span>Checking authentication...</span>
        </div>
      </div>
    )
  }

  // If not authenticated, show loading while redirecting
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Shield className="h-5 w-5 animate-pulse" />
          <span>Redirecting to login...</span>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      toast({
        title: 'Logged out',
        description: 'You have been logged out of the admin panel.',
      })
      router.push('/admin/login')
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to logout. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoggingOut(false)
    }
  }

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Admin Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-card border-r transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-16'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b bg-gradient-to-r from-primary/10 to-transparent">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground">
              <Mountain className="h-5 w-5" />
            </div>
            {sidebarOpen && (
              <div>
                <span className="font-bold text-lg">TrekConnect</span>
                <span className="text-xs text-muted-foreground block">
                  Admin Panel
                </span>
              </div>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-8 w-8"
          >
            {sidebarOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {adminNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                  active
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="flex-1">{item.title}</span>
                    {active && <ChevronRight className="h-4 w-4" />}
                  </>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10',
              !sidebarOpen && 'justify-center px-2'
            )}
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && (
              <span className="ml-2">
                {loggingOut ? 'Logging out...' : 'Logout'}
              </span>
            )}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          'min-h-screen transition-all duration-300',
          sidebarOpen ? 'ml-64' : 'ml-16'
        )}
      >
        {children}
      </main>
    </div>
  )
}
