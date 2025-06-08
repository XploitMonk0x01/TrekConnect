
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
import { NAV_ITEMS, APP_NAME, AUTH_SIGNIN_NAV_ITEM, AUTH_SIGNOUT_NAV_ITEM, PLACEHOLDER_IMAGE_URL } from '@/lib/constants';
import { UserCircle, ChevronDown, LogOut, LogIn } from 'lucide-react'; // Added LogIn
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';


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
      router.push(AUTH_SIGNOUT_NAV_ITEM.href); 
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({ variant: 'destructive', title: 'Sign Out Failed', description: error.message || 'Could not sign out.' });
    }
  };

  const getAvatarFallback = (displayName?: string | null, email?: string | null) => {
    if (displayName) return displayName.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return <UserCircle className="h-6 w-6" />; // Slightly smaller for fallback icon
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
                <AvatarImage 
                  src={user.photoURL || PLACEHOLDER_IMAGE_URL(40,40)} 
                  alt={user.displayName || 'User'} 
                  data-ai-hint="profile person" 
                  onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_URL(40,40);}}
                />
                <AvatarFallback>{getAvatarFallback(user.displayName, user.email)}</AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline">{user.displayName || user.email || 'User'}</span>
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
            <LogIn className="mr-2 h-4 w-4" />
            {AUTH_SIGNIN_NAV_ITEM.label}
          </Link>
        </Button>
      )}
    </header>
  );
}
