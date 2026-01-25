'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  NAV_ITEMS,
  APP_NAME,
  AUTH_SIGNIN_NAV_ITEM,
  AUTH_SIGNOUT_NAV_ITEM,
  SETTINGS_NAV_ITEM,
} from '@/lib/constants'
import {
  LogIn,
  UserCircle,
  ChevronDown,
  LogOut as LogOutIcon,
  Menu,
  Search,
  Bell,
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
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

interface AppHeaderProps {
  onMenuClick: () => void
  sidebarOpen: boolean
}

export function AppHeader({ onMenuClick, sidebarOpen }: AppHeaderProps) {
  const pathname = usePathname()
  const { user, signOut: customSignOut, isLoading } = useCustomAuth()
  const { toast } = useToast()
  const isMobile = useIsMobile()
  const [isScrolled, setIsScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Special handling for chat pages - show the other user's name instead of "Chat"
  const isChatPage = pathname.startsWith('/chat/')
  const isHomePage = pathname === '/'

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

  const headerClass = cn(
    'z-40 w-full transition-all duration-300',
    isHomePage
      ? isScrolled
        ? 'fixed top-0 border-b bg-background/80 backdrop-blur-md text-foreground'
        : 'fixed top-0 border-b border-transparent bg-transparent text-white'
      : 'sticky top-0 border-b bg-background/80 backdrop-blur-md text-foreground'
  )

  return (
    <header className={headerClass}>
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Menu toggle button - show on mobile, or on desktop when sidebar is collapsed */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className={cn(
            'p-2 hover:bg-accent',
            isMobile || !sidebarOpen ? 'flex' : 'hidden',
            isHomePage && !isScrolled
              ? 'text-white hover:bg-white/20 hover:text-white'
              : ''
          )}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Page title */}
        <div className="flex-1 min-w-0">
          <h1
            className={cn(
              'text-lg sm:text-xl font-semibold font-headline truncate',
              isHomePage && !isScrolled ? 'text-white' : 'text-foreground'
            )}
          >
            {pageTitle}
          </h1>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search button - hidden on mobile */}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'hidden sm:flex p-2 hover:bg-accent',
              isHomePage && !isScrolled
                ? 'text-white hover:bg-white/20 hover:text-white'
                : ''
            )}
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          {/* Notifications - hidden on mobile */}
          {user && (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'hidden sm:flex p-2 hover:bg-accent relative',
                isHomePage && !isScrolled
                  ? 'text-white hover:bg-white/20 hover:text-white'
                  : ''
              )}
            >
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-accent rounded-full"></span>
            </Button>
          )}

          {/* User menu or sign in */}
          {isLoading ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-muted"></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 px-2 sm:px-3 hover:bg-accent rounded-lg"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.photoUrl || PLACEHOLDER_IMAGE_URL(32, 32)}
                      alt={user.name || 'User avatar'}
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src =
                          PLACEHOLDER_IMAGE_URL(32, 32)
                      }}
                    />
                    <AvatarFallback>
                      {getAvatarFallback(user.name, user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="ml-2 hidden lg:inline text-sm font-medium truncate max-w-32">
                    {user.name || user.email}
                  </span>
                  <ChevronDown className="ml-1 h-4 w-4 hidden sm:inline opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <SETTINGS_NAV_ITEM.icon className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  {AUTH_SIGNOUT_NAV_ITEM.label}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default" size="sm" className="font-medium">
              <Link href={AUTH_SIGNIN_NAV_ITEM.href}>
                <LogIn className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">
                  {AUTH_SIGNIN_NAV_ITEM.label}
                </span>
                <span className="sm:hidden">Sign In</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
