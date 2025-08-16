'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  NAV_ITEMS,
  APP_NAME,
  AUTH_SIGNIN_NAV_ITEM,
  AUTH_SIGNOUT_NAV_ITEM,
  SETTINGS_NAV_ITEM,
} from '@/lib/constants' // Added SETTINGS_NAV_ITEM
import {
  LogIn,
  UserCircle,
  ChevronDown,
  LogOut as LogOutIcon,
} from 'lucide-react'
import { useCustomAuth } from '@/contexts/CustomAuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants'
import { useToast } from '@/hooks/use-toast'

export function AppHeader() {
  const pathname = usePathname()
  const { user, signOut: customSignOut, isLoading } = useCustomAuth()
  const { toast } = useToast()

  // Special handling for chat pages - show the other user's name instead of "Chat"
  const isChatPage = pathname.startsWith('/chat/')

  const currentNavItem =
    NAV_ITEMS.find((item) => {
      if (item.href === '/') return pathname === '/'
      return pathname.startsWith(item.href)
    }) || NAV_ITEMS.find((item) => item.href === '/')

  let pageTitle = currentNavItem?.label || APP_NAME

  // For chat pages, we'll update the title dynamically from the chat component
  if (isChatPage) {
    pageTitle = 'Chat'
  }

  const handleSignOut = async () => {
    try {
      await customSignOut()
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      })
      // Router push is handled by customSignOut in AuthContext
    } catch (error) {
      console.error('Sign out error in header:', error)
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
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto max-w-7xl flex h-14 items-center gap-4 px-4 sm:px-6">
        <SidebarTrigger className="md:hidden" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold font-headline text-foreground">
            {pageTitle}
          </h1>
        </div>
        {isLoading ? (
          <div className="h-8 w-20 animate-pulse rounded-md bg-muted"></div>
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-auto px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user.photoUrl || PLACEHOLDER_IMAGE_URL(32, 32)}
                    alt={user.name || 'User avatar'}
                    data-ai-hint={`person ${
                      user.name?.split(' ')[0] || 'user'
                    }`}
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src =
                        PLACEHOLDER_IMAGE_URL(32, 32)
                    }}
                  />
                  <AvatarFallback>
                    {getAvatarFallback(user.name, user.email)}
                  </AvatarFallback>
                </Avatar>
                <span className="ml-2 hidden md:inline">
                  {user.name || user.email}
                </span>
                <ChevronDown className="ml-1 h-4 w-4 hidden md:inline" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <UserCircle className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <SETTINGS_NAV_ITEM.icon className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer"
              >
                <LogOutIcon className="mr-2 h-4 w-4" />
                {AUTH_SIGNOUT_NAV_ITEM.label}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild variant="outline" size="sm">
            <Link href={AUTH_SIGNIN_NAV_ITEM.href}>
              <LogIn className="mr-2 h-4 w-4" />
              {AUTH_SIGNIN_NAV_ITEM.label}
            </Link>
          </Button>
        )}
      </div>
    </header>
  )
}
