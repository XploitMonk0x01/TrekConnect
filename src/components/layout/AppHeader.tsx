
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
import { UserCircle, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading } = useAuth();

  const currentNavItem = NAV_ITEMS.find(item => {
    if (item.href === '/') return pathname === '/';
    return pathname.startsWith(item.href);
  }) || NAV_ITEMS.find(item => item.href === '/');
  const pageTitle = currentNavItem?.label || APP_NAME;

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Signed Out', description: 'You have been successfully signed out.' });
      router.push(AUTH_SIGNOUT_NAV_ITEM.href); // Redirect to sign-in or home
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({ variant: 'destructive', title: 'Sign Out Failed', description: error.message || 'Could not sign out.' });
    }
  };

  // Fallback for avatar initial
  const getAvatarFallback = (displayName?: string | null) => {
    return displayName ? displayName.charAt(0).toUpperCase() : <UserCircle className="h-8 w-8" />;
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-4 sm:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1">
        <h1 className="text-lg font-semibold font-headline text-foreground">
          {pageTitle}
        </h1>
      </div>
      {loading ? (
        <div className="h-8 w-24 rounded-full bg-muted animate-pulse" />
      ) : user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-auto px-2 rounded-full flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.photoURL || PLACEHOLDER_IMAGE_URL(40,40)} alt={user.displayName || 'User'} data-ai-hint="profile person" />
                <AvatarFallback>{getAvatarFallback(user.displayName)}</AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline">{user.displayName || 'User'}</span>
              <ChevronDown className="h-4 w-4 opacity-70 hidden sm:inline" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
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
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
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
