
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { NAV_ITEMS, APP_NAME, AUTH_SIGNIN_NAV_ITEM } from '@/lib/constants';
import { LogIn } from 'lucide-react';
// Removed Avatar, DropdownMenu, UserCircle, ChevronDown, LogOut, useAuth, auth, signOut, useToast, PLACEHOLDER_IMAGE_URL

export function AppHeader() {
  const pathname = usePathname();

  const currentNavItem = NAV_ITEMS.find(item => {
    if (item.href === '/') return pathname === '/';
    return pathname.startsWith(item.href);
  }) || NAV_ITEMS.find(item => item.href === '/');
  const pageTitle = currentNavItem?.label || APP_NAME;

  // Removed handleSignOut and user-specific logic

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-4 sm:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1">
        <h1 className="text-lg font-semibold font-headline text-foreground">
          {pageTitle}
        </h1>
      </div>
      {/* Replaced user dropdown with a simple Sign In button */}
      <Button asChild variant="outline">
        <Link href={AUTH_SIGNIN_NAV_ITEM.href}>
          <LogIn className="mr-2 h-4 w-4" />
          {AUTH_SIGNIN_NAV_ITEM.label}
        </Link>
      </Button>
    </header>
  );
}
