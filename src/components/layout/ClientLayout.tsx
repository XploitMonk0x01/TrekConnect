'use client'

import { ReactNode, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { AppHeader } from '@/components/layout/AppHeader'
import { Footer } from '@/components/layout/Footer'
import { Toaster } from '@/components/ui/toaster'
import { Providers } from '@/app/providers'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

export function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useIsMobile()

  // Close sidebar when switching to mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [isMobile])

  // Close sidebar when clicking outside on mobile
  const handleOverlayClick = () => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false)
    }
  }

  return (
    <Providers>
      <Toaster />
      {isAdminRoute ? (
        <div className="min-h-screen bg-background">{children}</div>
      ) : (
        <div className="flex min-h-screen bg-background">
          {/* Mobile overlay */}
          {isMobile && sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={handleOverlayClick}
              aria-hidden="true"
            />
          )}

          {/* Sidebar */}
          <AppSidebar
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            isMobile={isMobile}
          />

          {/* Main content area */}
          <div
            className={cn(
              'flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out',
              // Desktop: adjust margin based on sidebar state
              !isMobile && sidebarOpen && 'lg:ml-64',
              !isMobile && !sidebarOpen && 'lg:ml-16'
            )}
          >
            <AppHeader
              onMenuClick={() => setSidebarOpen(!sidebarOpen)}
              sidebarOpen={sidebarOpen}
            />

            {/* Main content */}
            <main className="flex-1 overflow-x-hidden">
              <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
                {children}
              </div>
            </main>

            <Footer />
          </div>
        </div>
      )}
    </Providers>
  )
}
