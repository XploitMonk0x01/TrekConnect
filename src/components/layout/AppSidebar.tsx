
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
import { NAV_ITEMS, SETTINGS_NAV_ITEM, AUTH_SIGNIN_NAV_ITEM, NavItem } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
// Removed useAuth, auth, signOut, useToast, LogOut, AUTH_SIGNOUT_NAV_ITEM
import { Loader2 } from 'lucide-react'; // Kept for potential loading state for new auth

export function AppSidebar() {
  const pathname = usePathname();
  // const router = useRouter(); // Kept if needed for navigation from sidebar
  // const { toast } = useToast(); // Kept if sidebar actions need toasts
  // const { user, loading } = useAuth(); // Removed

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
  
  // Removed handleSignOut

  // Placeholder for new auth loading state, default to false (not loading)
  const loading = false; 
  // Placeholder for new auth user state, default to null (logged out)
  const user = null; 

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
           {/* Simplified auth-dependent UI */}
           {!loading && user ? (
             <SidebarMenuItem>
                {/* This block will be unreachable with user=null, for future custom auth */}
                <SidebarMenuButton
                  onClick={() => { /* Implement custom sign out */ }}
                  tooltip={"Sign Out"}
                  className="justify-start w-full text-left cursor-pointer"
                  asChild={false}
                >
                  {/* Replace LogOut icon if needed for custom auth */}
                  <SETTINGS_NAV_ITEM.icon className="h-5 w-5" /> 
                  <span>{"Sign Out"}</span>
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
