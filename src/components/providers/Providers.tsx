
'use client'

import { ReactNode } from 'react'
// AuthProvider import removed

// This component is simplified. If you add other global providers (e.g., ThemeProvider),
// they can be added here.
export function Providers({ children }: { children: ReactNode }) {
  return <>{children}</>
}
