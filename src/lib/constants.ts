
import type { LucideIcon } from 'lucide-react';
import { Compass, Users, Wand2, Image as ImageIcon, BookOpen, UserCircle, Settings, LogOut, LayoutDashboard, LogIn } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  matchSegments?: number; // Number of path segments to match for active state
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, matchSegments: 1 },
  { href: '/explore', label: 'Explore', icon: Compass, matchSegments: 1 },
  { href: '/connect', label: 'ConnectSphere', icon: Users, matchSegments: 1 },
  { href: '/recommendations', label: 'Smart Picks', icon: Wand2, matchSegments: 1 },
  { href: '/feed', label: 'Photo Feed', icon: ImageIcon, matchSegments: 1 },
  { href: '/stories', label: 'Travel Stories', icon: BookOpen, matchSegments: 1 },
  { href: '/profile', label: 'My Profile', icon: UserCircle, matchSegments: 1 },
];

export const SETTINGS_NAV_ITEM: NavItem = { href: '/settings', label: 'Settings', icon: Settings, matchSegments: 1 };
export const AUTH_SIGNIN_NAV_ITEM: NavItem = { href: '/auth/signin', label: 'Sign In', icon: LogIn, matchSegments: 2 };
export const AUTH_SIGNUP_NAV_ITEM: NavItem = { href: '/auth/signup', label: 'Sign Up', icon: UserCircle, matchSegments: 2 };
export const AUTH_SIGNOUT_NAV_ITEM: NavItem = { href: '/auth/signin', label: 'Sign Out', icon: LogOut, matchSegments: 0 }; // href to signin after signout

export const APP_NAME = "TrekConnect";
export const APP_DESCRIPTION = "Connect with fellow trekkers and explore new horizons.";

export const PLACEHOLDER_IMAGE_URL = (width: number, height: number) => `https://placehold.co/${width}x${height}.png`;
