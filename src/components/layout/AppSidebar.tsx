
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
import { NAV_ITEMS, SETTINGS_NAV_ITEM, AUTH_SIGNOUT_NAV_ITEM, NavItem, AUTH_SIGNIN_NAV_ITEM } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { LogOut } from 'lucide-react';


export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading } = useAuth();

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
      await signOut(auth);
      toast({ title: 'Signed Out', description: 'You have been successfully signed out.' });
      router.push(AUTH_SIGNOUT_NAV_ITEM.href); 
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({ variant: 'destructive', title: 'Sign Out Failed', description: error.message || 'Could not sign out.' });
    }
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
          <Separator className="my-1 bg-sidebar-border" />
           {!loading && user ? (
             <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleSignOut}
                  tooltip={AUTH_SIGNOUT_NAV_ITEM.label}
                  className="justify-start w-full text-left cursor-pointer"
                  asChild={false}
                >
                  <LogOut className="h-5 w-5" />
                  <span>{AUTH_SIGNOUT_NAV_ITEM.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
           ) : !loading && !user ? (
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
           ) : (
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
           )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
