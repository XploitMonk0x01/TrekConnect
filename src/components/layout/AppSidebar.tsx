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
import { NAV_ITEMS, SETTINGS_NAV_ITEM, AUTH_SIGNOUT_NAV_ITEM, NavItem } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export function AppSidebar() {
  const pathname = usePathname();

  const isActive = (item: NavItem) => {
    if (item.href === '/') {
      return pathname === '/';
    }
    // For nested routes, check if the current pathname starts with the item's href
    // and matches the specified number of segments.
    if (item.matchSegments && item.matchSegments > 0) {
      const currentSegments = pathname.split('/').filter(Boolean);
      const itemSegments = (item.href as string).split('/').filter(Boolean);
      if (currentSegments.length >= itemSegments.length) {
        return itemSegments.every((segment, index) => segment === currentSegments[index]);
      }
    }
    return pathname.startsWith(item.href);
  };
  
  // Simulate authentication state
  const isAuthenticated = true; // Replace with actual auth check

  return (
    <Sidebar side="left" variant="sidebar" collapsible="icon">
      <SidebarHeader className="p-4">
        <SiteLogo />
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto p-2">
        <SidebarMenu>
          {NAV_ITEMS.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href as Route} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={isActive(item)}
                  tooltip={item.label}
                  className={cn(
                    'justify-start',
                    isActive(item) && 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90'
                  )}
                  aria-current={isActive(item) ? 'page' : undefined}
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
            <Link href={SETTINGS_NAV_ITEM.href as Route} passHref legacyBehavior>
              <SidebarMenuButton
                isActive={isActive(SETTINGS_NAV_ITEM)}
                tooltip={SETTINGS_NAV_ITEM.label}
                className={cn(
                  'justify-start',
                  isActive(SETTINGS_NAV_ITEM) && 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90'
                )}
              >
                <SETTINGS_NAV_ITEM.icon className="h-5 w-5" />
                <span>{SETTINGS_NAV_ITEM.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <Separator className="my-1 bg-sidebar-border" />
           {isAuthenticated ? (
             <SidebarMenuItem>
                <Link href={AUTH_SIGNOUT_NAV_ITEM.href as Route} passHref legacyBehavior>
                  <SidebarMenuButton
                    tooltip={AUTH_SIGNOUT_NAV_ITEM.label}
                    className="justify-start w-full text-left"
                    // onClick={() => { /* Handle sign out */ }}
                  >
                    <AUTH_SIGNOUT_NAV_ITEM.icon className="h-5 w-5" />
                    <span>{AUTH_SIGNOUT_NAV_ITEM.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
           ) : (
            <SidebarMenuItem>
              <Link href={AUTH_SIGNOUT_NAV_ITEM.href as Route} passHref legacyBehavior>
                <SidebarMenuButton
                  tooltip={AUTH_SIGNOUT_NAV_ITEM.label}
                  className="justify-start w-full text-left"
                >
                  <AUTH_SIGNOUT_NAV_ITEM.icon className="h-5 w-5" />
                  <span>Sign In</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
           )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
