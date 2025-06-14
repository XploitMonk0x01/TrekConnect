'use client'

import { ThemeProvider } from 'next-themes'
import { CustomAuthProvider } from '@/contexts/CustomAuthContext'
import { ChatProvider } from '@/contexts/ChatContext'
import { Toaster } from '@/components/ui/toaster'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <CustomAuthProvider>
        <ChatProvider>{children}</ChatProvider>
      </CustomAuthProvider>
      <Toaster />
    </ThemeProvider>
  )
}
