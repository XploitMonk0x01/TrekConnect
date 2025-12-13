'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { Route } from 'next'
import { cn } from '@/lib/utils'
import { SiteLogo } from '@/components/SiteLogo'
import {
  NAV_ITEMS,
  SETTINGS_NAV_ITEM,
  AUTH_SIGNIN_NAV_ITEM,
  AUTH_SIGNOUT_NAV_ITEM,
  NavItem,
} from '@/lib/constants'
import { useCustomAuth } from '@/contexts/CustomAuthContext'
import { useToast } from '@/hooks/use-toast'
import {
  Loader2,
  UserCircle,
  LogOut as LogOutIcon,
  ChevronLeft,
  ChevronRight,
  Mountain,
  Sparkles,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants'

interface AppSidebarProps {
  isOpen: boolean
  onToggle: () => void
  isMobile: boolean
}

export function AppSidebar({ isOpen, onToggle, isMobile }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading, signOut: customSignOut } = useCustomAuth()

  const isActive = (item: NavItem) => {
    if (item.href === '/') {
      return pathname === '/'
    }
    if (item.matchSegments && item.matchSegments > 0) {
      const currentSegments = pathname.split('/').filter(Boolean)
      const itemSegments = (item.href as string).split('/').filter(Boolean)
      if (currentSegments.length >= itemSegments.length) {
        return itemSegments.every(
          (segment, index) => segment === currentSegments[index]
        )
      }
    }
    return pathname.startsWith(item.href)
  }

  const handleSignOut = async () => {
    try {
      await customSignOut()
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      })
    } catch (error) {
      console.error('Sign out error in sidebar:', error)
      toast({
        variant: 'destructive',
        title: 'Sign Out Failed',
        description: 'Could not sign you out. Please try again.',
      })
    }
  }

  const getAvatarFallback = (
    name?: string | null,
    email?: string | null
  ): string => {
    if (name) return name.charAt(0).toUpperCase()
    if (email) return email.charAt(0).toUpperCase()
    return 'U'
  }

  return (
    <>
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full transition-all duration-300 ease-in-out',
          'flex flex-col',
          // Himalayan gradient background
          'bg-gradient-to-b from-sidebar-background via-sidebar-background to-sidebar-accent/30',
          'border-r border-sidebar-border/50',
          // Subtle shadow for depth
          'shadow-lg shadow-sidebar-border/10',
          // Mobile: slide in/out from left
          isMobile && 'w-64',
          isMobile && isOpen && 'translate-x-0',
          isMobile && !isOpen && '-translate-x-full',
          // Desktop: expand/collapse
          !isMobile && isOpen && 'w-64',
          !isMobile && !isOpen && 'w-16'
        )}
      >
        {/* Decorative mountain silhouette at top */}
        <div className="absolute top-0 left-0 right-0 h-32 overflow-hidden pointer-events-none opacity-5">
          <svg
            viewBox="0 0 200 100"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0 100 L30 40 L50 60 L80 20 L110 50 L140 10 L170 45 L200 30 L200 100 Z"
              fill="currentColor"
              className="text-primary"
            />
          </svg>
        </div>

        {/* Header */}
        <div
          className={cn(
            'relative flex items-center border-b border-sidebar-border/50',
            'bg-gradient-to-r from-transparent via-primary/5 to-transparent',
            isOpen ? 'h-16 px-6 justify-between' : 'h-16 px-3 justify-center'
          )}
        >
          {isOpen ? (
            <>
              <div className="flex items-center gap-2">
                <SiteLogo />
              </div>
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="p-2 hover:bg-primary/10 hover:text-primary rounded-full transition-all duration-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="p-2 hover:bg-primary/10 hover:text-primary rounded-full transition-all duration-200"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          {/* Section Label */}
          {isOpen && (
            <div className="px-6 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-2">
                <Mountain className="h-3 w-3" />
                Explore
              </span>
            </div>
          )}
          <ul className="space-y-1 px-3">
            {NAV_ITEMS.map((item, index) => (
              <li key={item.label}>
                <Link href={item.href as Route}>
                  <button
                    className={cn(
                      'group w-full flex items-center rounded-xl transition-all duration-200',
                      'hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent',
                      'hover:translate-x-1',
                      isOpen
                        ? 'px-4 py-3 justify-start gap-3'
                        : 'px-2 py-3 justify-center',
                      isActive(item) &&
                        'bg-gradient-to-r from-primary to-primary/80 text-white shadow-md shadow-primary/30',
                      !isActive(item) && 'hover:text-primary'
                    )}
                    title={!isOpen ? item.label : undefined}
                  >
                    <div
                      className={cn(
                        'flex items-center justify-center rounded-lg transition-all duration-200',
                        isActive(item)
                          ? 'bg-white/20'
                          : 'bg-primary/10 group-hover:bg-primary/20',
                        isOpen ? 'p-2' : 'p-2'
                      )}
                    >
                      <item.icon
                        className={cn(
                          'flex-shrink-0 transition-transform duration-200 group-hover:scale-110',
                          isOpen ? 'h-4 w-4' : 'h-5 w-5',
                          isActive(item) ? 'text-white' : 'text-primary'
                        )}
                      />
                    </div>
                    {isOpen && (
                      <span
                        className={cn(
                          'font-medium truncate',
                          isActive(item) ? 'text-white' : ''
                        )}
                      >
                        {item.label}
                      </span>
                    )}
                    {isOpen && isActive(item) && (
                      <Sparkles className="ml-auto h-4 w-4 text-white/70 animate-pulse" />
                    )}
                  </button>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border/50 p-3 bg-gradient-to-t from-sidebar-accent/20 to-transparent">
          {isLoading ? (
            <div
              className={cn(
                'flex items-center rounded-xl bg-primary/5',
                isOpen ? 'px-4 py-3 gap-3' : 'px-2 py-3 justify-center'
              )}
            >
              <Loader2 className="h-5 w-5 animate-spin flex-shrink-0 text-primary" />
              {isOpen && (
                <span className="text-sm text-muted-foreground">
                  Loading...
                </span>
              )}
            </div>
          ) : user ? (
            <div className="space-y-1">
              {/* User Profile */}
              <Link href="/profile">
                <button
                  className={cn(
                    'group w-full flex items-center rounded-xl transition-all duration-200',
                    'hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent',
                    'hover:translate-x-1',
                    isOpen
                      ? 'px-4 py-3 justify-start gap-3'
                      : 'px-2 py-3 justify-center',
                    isActive({
                      href: '/profile',
                      label: 'Profile',
                      icon: UserCircle,
                    }) &&
                      'bg-gradient-to-r from-primary to-primary/80 text-white shadow-md shadow-primary/30'
                  )}
                  title={
                    !isOpen ? user.name || user.email || 'Profile' : undefined
                  }
                >
                  <Avatar className="h-8 w-8 flex-shrink-0 ring-2 ring-primary/30 ring-offset-2 ring-offset-sidebar-background">
                    <AvatarImage
                      src={user.photoUrl || PLACEHOLDER_IMAGE_URL(32, 32)}
                      alt={user.name || 'User'}
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src =
                          PLACEHOLDER_IMAGE_URL(32, 32)
                      }}
                    />
                    <AvatarFallback className="text-xs bg-primary text-white">
                      {getAvatarFallback(user.name, user.email)}
                    </AvatarFallback>
                  </Avatar>
                  {isOpen && (
                    <div className="flex flex-col items-start">
                      <span className="font-medium truncate text-sm">
                        {user.name || 'Trekker'}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        View Profile
                      </span>
                    </div>
                  )}
                </button>
              </Link>

              {/* Settings */}
              <Link href={SETTINGS_NAV_ITEM.href as Route}>
                <button
                  className={cn(
                    'group w-full flex items-center rounded-xl transition-all duration-200',
                    'hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent',
                    'hover:translate-x-1',
                    isOpen
                      ? 'px-4 py-3 justify-start gap-3'
                      : 'px-2 py-3 justify-center',
                    isActive(SETTINGS_NAV_ITEM) &&
                      'bg-gradient-to-r from-primary to-primary/80 text-white shadow-md shadow-primary/30'
                  )}
                  title={!isOpen ? SETTINGS_NAV_ITEM.label : undefined}
                >
                  <div
                    className={cn(
                      'flex items-center justify-center rounded-lg transition-all duration-200',
                      isActive(SETTINGS_NAV_ITEM)
                        ? 'bg-white/20'
                        : 'bg-muted/50 group-hover:bg-primary/10',
                      'p-2'
                    )}
                  >
                    <SETTINGS_NAV_ITEM.icon
                      className={cn(
                        'flex-shrink-0 transition-transform duration-200 group-hover:scale-110',
                        isOpen ? 'h-4 w-4' : 'h-5 w-5',
                        isActive(SETTINGS_NAV_ITEM)
                          ? 'text-white'
                          : 'text-muted-foreground group-hover:text-primary'
                      )}
                    />
                  </div>
                  {isOpen && (
                    <span className="font-medium text-sm">
                      {SETTINGS_NAV_ITEM.label}
                    </span>
                  )}
                </button>
              </Link>

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                className={cn(
                  'group w-full flex items-center rounded-xl transition-all duration-200',
                  'hover:bg-gradient-to-r hover:from-destructive/10 hover:to-transparent',
                  'hover:translate-x-1',
                  isOpen
                    ? 'px-4 py-3 justify-start gap-3'
                    : 'px-2 py-3 justify-center'
                )}
                title={!isOpen ? AUTH_SIGNOUT_NAV_ITEM.label : undefined}
              >
                <div
                  className={cn(
                    'flex items-center justify-center rounded-lg transition-all duration-200',
                    'bg-destructive/10 group-hover:bg-destructive/20',
                    'p-2'
                  )}
                >
                  <LogOutIcon
                    className={cn(
                      'flex-shrink-0 text-destructive transition-transform duration-200 group-hover:scale-110',
                      isOpen ? 'h-4 w-4' : 'h-5 w-5'
                    )}
                  />
                </div>
                {isOpen && (
                  <span className="font-medium text-sm text-destructive">
                    {AUTH_SIGNOUT_NAV_ITEM.label}
                  </span>
                )}
              </button>
            </div>
          ) : (
            <Link href={AUTH_SIGNIN_NAV_ITEM.href as Route}>
              <button
                className={cn(
                  'group w-full flex items-center rounded-xl transition-all duration-200',
                  'bg-gradient-to-r from-primary to-accent text-white',
                  'hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02]',
                  isOpen
                    ? 'px-4 py-3 justify-start gap-3'
                    : 'px-2 py-3 justify-center'
                )}
                title={!isOpen ? AUTH_SIGNIN_NAV_ITEM.label : undefined}
              >
                <AUTH_SIGNIN_NAV_ITEM.icon
                  className={cn(
                    'flex-shrink-0',
                    isOpen ? 'h-5 w-5' : 'h-6 w-6'
                  )}
                />
                {isOpen && (
                  <span className="font-semibold">Start Your Adventure</span>
                )}
              </button>
            </Link>
          )}
        </div>

        {/* Decorative mountain silhouette at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden pointer-events-none opacity-5">
          <svg
            viewBox="0 0 200 100"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0 100 L0 70 L40 50 L70 70 L100 40 L130 60 L160 35 L200 55 L200 100 Z"
              fill="currentColor"
              className="text-primary"
            />
          </svg>
        </div>
      </aside>
    </>
  )
}
