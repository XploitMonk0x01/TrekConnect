
'use client'

import { ThemeProvider } from 'next-themes'
import { CustomAuthProvider } from '@/contexts/CustomAuthContext'
import { ChatProvider } from '@/contexts/ChatContext'
// Toaster is often placed in ClientLayout or at the root of where toasts are used,
// but including it here ensures its provider context is available if needed by other providers.
// However, its direct rendering is usually handled in a layout component.
// For simplicity and standard practice, Toaster is rendered in ClientLayout.

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <CustomAuthProvider>
        <ChatProvider>{children}</ChatProvider>
      </CustomAuthProvider>
      {/* Toaster is now typically rendered in ClientLayout to ensure it's outside specific context providers
          but within the ThemeProvider if its styling depends on the theme. */}
    </ThemeProvider>
  )
}
