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
          'fixed top-0 left-0 z-50 h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out',
          'flex flex-col',
          // Mobile: slide in/out from left
          isMobile && 'w-64',
          isMobile && isOpen && 'translate-x-0',
          isMobile && !isOpen && '-translate-x-full',
          // Desktop: expand/collapse
          !isMobile && isOpen && 'w-64',
          !isMobile && !isOpen && 'w-16'
        )}
      >
        {/* Header */}
        <div
          className={cn(
            'flex items-center border-b border-sidebar-border',
            isOpen ? 'h-16 px-6 justify-between' : 'h-16 px-3 justify-center'
          )}
        >
          {isOpen ? (
            <>
              <SiteLogo />
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="p-2 hover:bg-sidebar-accent"
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
              className="p-2 hover:bg-sidebar-accent"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          <ul className="space-y-2 px-3">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <Link href={item.href as Route}>
                  <button
                    className={cn(
                      'w-full flex items-center rounded-lg transition-colors duration-200',
                      'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      isOpen
                        ? 'px-3 py-2 justify-start gap-3'
                        : 'px-2 py-2 justify-center',
                      isActive(item) &&
                        'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90'
                    )}
                    title={!isOpen ? item.label : undefined}
                  >
                    <item.icon
                      className={cn(
                        'flex-shrink-0',
                        isOpen ? 'h-5 w-5' : 'h-6 w-6'
                      )}
                    />
                    {isOpen && (
                      <span className="font-medium truncate">{item.label}</span>
                    )}
                  </button>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-3">
          {isLoading ? (
            <div
              className={cn(
                'flex items-center rounded-lg',
                isOpen ? 'px-3 py-2 gap-3' : 'px-2 py-2 justify-center'
              )}
            >
              <Loader2 className="h-5 w-5 animate-spin flex-shrink-0" />
              {isOpen && <span className="text-sm">Loading...</span>}
            </div>
          ) : user ? (
            <div className="space-y-2">
              {/* User Profile */}
              <Link href="/profile">
                <button
                  className={cn(
                    'w-full flex items-center rounded-lg transition-colors duration-200',
                    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    isOpen
                      ? 'px-3 py-2 justify-start gap-3'
                      : 'px-2 py-2 justify-center',
                    isActive({
                      href: '/profile',
                      label: 'Profile',
                      icon: UserCircle,
                    }) &&
                      'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90'
                  )}
                  title={
                    !isOpen ? user.name || user.email || 'Profile' : undefined
                  }
                >
                  <Avatar className="h-6 w-6 flex-shrink-0">
                    <AvatarImage
                      src={user.photoUrl || PLACEHOLDER_IMAGE_URL(24, 24)}
                      alt={user.name || 'User'}
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src =
                          PLACEHOLDER_IMAGE_URL(24, 24)
                      }}
                    />
                    <AvatarFallback className="text-xs">
                      {getAvatarFallback(user.name, user.email)}
                    </AvatarFallback>
                  </Avatar>
                  {isOpen && (
                    <span className="font-medium truncate">
                      {user.name || user.email}
                    </span>
                  )}
                </button>
              </Link>

              {/* Settings */}
              <Link href={SETTINGS_NAV_ITEM.href as Route}>
                <button
                  className={cn(
                    'w-full flex items-center rounded-lg transition-colors duration-200',
                    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    isOpen
                      ? 'px-3 py-2 justify-start gap-3'
                      : 'px-2 py-2 justify-center',
                    isActive(SETTINGS_NAV_ITEM) &&
                      'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90'
                  )}
                  title={!isOpen ? SETTINGS_NAV_ITEM.label : undefined}
                >
                  <SETTINGS_NAV_ITEM.icon
                    className={cn(
                      'flex-shrink-0',
                      isOpen ? 'h-5 w-5' : 'h-6 w-6'
                    )}
                  />
                  {isOpen && (
                    <span className="font-medium">
                      {SETTINGS_NAV_ITEM.label}
                    </span>
                  )}
                </button>
              </Link>

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                className={cn(
                  'w-full flex items-center rounded-lg transition-colors duration-200',
                  'hover:bg-destructive hover:text-destructive-foreground',
                  isOpen
                    ? 'px-3 py-2 justify-start gap-3'
                    : 'px-2 py-2 justify-center'
                )}
                title={!isOpen ? AUTH_SIGNOUT_NAV_ITEM.label : undefined}
              >
                <LogOutIcon
                  className={cn(
                    'flex-shrink-0',
                    isOpen ? 'h-5 w-5' : 'h-6 w-6'
                  )}
                />
                {isOpen && (
                  <span className="font-medium">
                    {AUTH_SIGNOUT_NAV_ITEM.label}
                  </span>
                )}
              </button>
            </div>
          ) : (
            <Link href={AUTH_SIGNIN_NAV_ITEM.href as Route}>
              <button
                className={cn(
                  'w-full flex items-center rounded-lg transition-colors duration-200',
                  'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  isOpen
                    ? 'px-3 py-2 justify-start gap-3'
                    : 'px-2 py-2 justify-center',
                  isActive(AUTH_SIGNIN_NAV_ITEM) &&
                    'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90'
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
                  <span className="font-medium">
                    {AUTH_SIGNIN_NAV_ITEM.label}
                  </span>
                )}
              </button>
            </Link>
          )}
        </div>
      </aside>
    </>
  )
}
