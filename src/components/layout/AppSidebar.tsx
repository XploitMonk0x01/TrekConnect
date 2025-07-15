
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // Added useRouter
import type { Route } from 'next';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { SiteLogo } from '@/components/SiteLogo';
import { NAV_ITEMS, SETTINGS_NAV_ITEM, AUTH_SIGNIN_NAV_ITEM, AUTH_SIGNOUT_NAV_ITEM, NavItem } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useCustomAuth } from '@/contexts/CustomAuthContext'; // Use custom hook
import { useToast } from '@/hooks/use-toast'; // For sign out toast
import { Loader2, UserCircle, LogOut as LogOutIcon } from 'lucide-react'; 
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';


export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter(); 
  const { toast } = useToast(); 
  const { user, isLoading, signOut: customSignOut } = useCustomAuth(); 

  const isActive = (item: NavItem) => {
    if (item.href === '/') {
      return pathname === '/';
    }
    if (item.matchSegments && item.matchSegments > 0) {
      const currentSegments = pathname.split('/').filter(Boolean);
      const itemSegments = (item.href as string).split('/').filter(Boolean);
      if (currentSegments.length >= itemSegments.length) {
        return itemSegments.every((segment, index) => segment === currentSegments[index]);
      }
    }
    return pathname.startsWith(item.href);
  };
  
  const handleSignOut = async () => {
    try {
      await customSignOut();
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
      // Router push is handled by customSignOut in AuthContext
    } catch (error) {
      console.error('Sign out error in sidebar:', error);
      toast({
        variant: 'destructive',
        title: 'Sign Out Failed',
        description: 'Could not sign you out. Please try again.',
      });
    }
  };

  const getAvatarFallback = (name?: string | null, email?: string | null): string => {
    if (name) return name.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return 'U';
  };


  return (
    <Sidebar side="left" variant="sidebar" collapsible="icon">
      <SidebarHeader className="p-4">
        <SiteLogo />
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto p-2">
        <SidebarMenu>
          {NAV_ITEMS.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href as Route} passHref>
                <SidebarMenuButton
                  isActive={isActive(item)}
                  tooltip={item.label}
                  className={cn(
                    'justify-start',
                    isActive(item) && 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90'
                  )}
                  aria-current={isActive(item) ? 'page' : undefined}
                  asChild={false}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 border-t border-sidebar-border">
        <SidebarMenu>
          {isLoading ? (
             <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Loading..."
                  className="justify-start w-full text-left"
                  disabled
                  asChild={false}
                >
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Loading...</span>
                </SidebarMenuButton>
             </SidebarMenuItem>
           ) : user ? (
            <>
            <SidebarMenuItem>
                <Link href="/profile" passHref>
                    <SidebarMenuButton
                    isActive={isActive({href: '/profile', label: 'Profile', icon: UserCircle})}
                    tooltip="Your Profile"
                    className={cn(
                        'justify-start',
                        isActive({href: '/profile', label: 'Profile', icon: UserCircle}) && 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90'
                    )}
                    asChild={false}
                    >
                        <Avatar className="h-6 w-6">
                             <AvatarImage 
                                src={user.photoUrl || PLACEHOLDER_IMAGE_URL(24,24)} 
                                alt={user.name || 'User'} 
                                data-ai-hint={`person ${user.name?.split(' ')[0] || 'user'}`}
                                onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_URL(24,24); }}
                                />
                             <AvatarFallback className="text-xs">{getAvatarFallback(user.name, user.email)}</AvatarFallback>
                        </Avatar>
                        <span className="truncate">{user.name || user.email}</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href={SETTINGS_NAV_ITEM.href as Route} passHref>
                <SidebarMenuButton
                  isActive={isActive(SETTINGS_NAV_ITEM)}
                  tooltip={SETTINGS_NAV_ITEM.label}
                  className={cn(
                    'justify-start',
                    isActive(SETTINGS_NAV_ITEM) && 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90'
                  )}
                  asChild={false}
                >
                  <SETTINGS_NAV_ITEM.icon className="h-5 w-5" />
                  <span>{SETTINGS_NAV_ITEM.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleSignOut}
                  tooltip={AUTH_SIGNOUT_NAV_ITEM.label}
                  className="justify-start w-full text-left cursor-pointer"
                  asChild={false}
                >
                  <LogOutIcon className="h-5 w-5" /> 
                  <span>{AUTH_SIGNOUT_NAV_ITEM.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
           ) : (
            <SidebarMenuItem>
              <Link href={AUTH_SIGNIN_NAV_ITEM.href as Route} passHref>
                <SidebarMenuButton
                  isActive={isActive(AUTH_SIGNIN_NAV_ITEM)}
                  tooltip={AUTH_SIGNIN_NAV_ITEM.label}
                  className={cn(
                    'justify-start',
                     isActive(AUTH_SIGNIN_NAV_ITEM) && 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90'
                  )}
                  asChild={false}
                >
                  <AUTH_SIGNIN_NAV_ITEM.icon className="h-5 w-5" />
                  <span>{AUTH_SIGNIN_NAV_ITEM.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
           )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
