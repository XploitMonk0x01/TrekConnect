
'use client'

import { ReactNode } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { AppHeader } from '@/components/layout/AppHeader'
import { Footer } from '@/components/layout/Footer'
import { Toaster } from '@/components/ui/toaster' // Keep Toaster import here
import { Providers } from '@/app/providers' // Corrected import path for app-level providers

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <Providers> {/* This Providers includes ThemeProvider, CustomAuthProvider, ChatProvider */}
      <Toaster /> {/* Toaster can be here, accessible by hooks from children */}
      <SidebarProvider defaultOpen>
        <div className="flex min-h-screen"> {/* Ensure full height */}
          <AppSidebar />
          <div className="flex flex-col flex-1 md:ml-[var(--sidebar-width-icon)] group-data-[state=expanded]/sidebar-wrapper:md:ml-[var(--sidebar-width)] transition-[margin-left] duration-200 ease-linear">
            <AppHeader />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background">
              {children}
            </main>
            <Footer />
          </div>
        </div>
      </SidebarProvider>
    </Providers>
  )
}
