'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { NAV_ITEMS, APP_NAME, AUTH_SIGNIN_NAV_ITEM, AUTH_SIGNOUT_NAV_ITEM } from '@/lib/constants';
import { UserCircle, ChevronDown } from 'lucide-react';

export function AppHeader() {
  const pathname = usePathname();
  const currentNavItem = NAV_ITEMS.find(item => pathname.startsWith(item.href)) || NAV_ITEMS.find(item => item.href === '/');
  const pageTitle = currentNavItem?.label || APP_NAME;

  // Simulate authentication state
  const isAuthenticated = true; // Replace with actual auth check
  const userName = "Wanderer"; // Replace with actual user name
  const userEmail = "wanderer@example.com"; // Replace with actual user email
  const userPhotoUrl = "https://placehold.co/40x40.png"; // Replace with actual user photo

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-4 sm:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1">
        <h1 className="text-lg font-semibold font-headline text-foreground">
          {pageTitle}
        </h1>
      </div>
      {isAuthenticated ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-auto px-2 rounded-full flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userPhotoUrl} alt={userName} data-ai-hint="profile person" />
                <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline">{userName}</span>
              <ChevronDown className="h-4 w-4 opacity-70 hidden sm:inline" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userEmail}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={AUTH_SIGNOUT_NAV_ITEM.href}>
                {/* Add onClick handler for signout logic */}
                Sign out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button asChild variant="outline">
          <Link href={AUTH_SIGNIN_NAV_ITEM.href}>
            <UserCircle className="mr-2 h-4 w-4" />
            Sign In
          </Link>
        </Button>
      )}
    </header>
  );
}
