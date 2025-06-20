'use client'

import { ReactNode } from 'react'
import { CustomAuthProvider } from '@/contexts/CustomAuthContext' // Updated import

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CustomAuthProvider>
      {' '}
      {/* Use CustomAuthProvider */}
      {children}
    </CustomAuthProvider>
  )
}
